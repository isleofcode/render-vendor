import RSVP from 'rsvp';

import _ from 'lodash';
import assert from 'assert';
import childProcess from 'child_process';
import path from 'path';
import phantomjs from 'phantomjs-prebuilt';
import request from 'request';
import { URL } from 'url';

import Renderer from '../../renderer';
import { SENTINELS } from './utils/sentinels';
import waitForTrue from '../../utils/wait-for-true';

const { defaults } = _;
const { Promise, denodeify } = RSVP;

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 8180;
const PHANTOM_SCRIPT = path.join(__dirname, '-main.js');

export class PhantomRenderer extends Renderer {
  static get DEFAULT_HOST() {
    return this._DEFAULT_HOST || DEFAULT_HOST;
  }

  static set DEFAULT_HOST(value) {
    return this._DEFAULT_HOST = value;
  }

  static get DEFAULT_PORT() {
    return this._DEFAULT_PORT || DEFAULT_PORT;
  }

  static set DEFAULT_PORT(value) {
    return this._DEFAULT_PORT = value;
  }

  static get request() {
    return denodeify(request);
  }

  constructor(attrs = {}) {
    super(attrs);

    this.host = this.host || this.constructor.DEFAULT_HOST;
    this.port = this.port || this.constructor.DEFAULT_PORT;
  }

  get url() {
    return `http://${this.host}:${this.port}`;
  }

  get port() {
    return this._port;
  }

  set port(value) {
    let port = this._port;

    assert.ok(port === undefined || port === value, 'cannot reset to new port');

    this._port = value;
  }

  get host() {
    return this._host;
  }

  set host(value) {
    let host = this._host;

    assert.ok(host === undefined || host === value, 'cannot reset to new host');

    this._host = value;
  }

  get phantom() {
    let phantom = this._phantom;

    if (phantom === null || phantom === undefined) {
      this._phantom = this._spawnPhantom();
      phantom = this._phantom;
    }

    return phantom;
  }

  async boot() {
    if (this.isBooted) {
      return;
    }

    if (!this.isBooting) {
      this.isBooting = true;
      this.phantom.stdin.write(`${this.port}\n`, 'utf8');
    }

    await waitForTrue(() => this.isBooted, 30000);

    this.phantom.stdin.end();
  }

  async shutdown() {
    let phantom = this.phantom;

    if (phantom === null || phantom === undefined) {
      this.isBooted = false;
    } else {
      phantom.kill();
      this._phantom = undefined;
    }
  }

  async ping() {
    return this._makeRequest('ping');
  }

  async loadPage(page, json = {}) {
    let didTimeout = false;
    let { url, html } = json;
    let isLoaded;

    json.id = page.id;

    if (html === undefined || html === null) {
      json.url = new URL(url || page.id).href;
    }

    page.isLoading = true;

    this._makeRequest('loadPage', {
      method: 'POST',
      body: json
    });

    isLoaded = page.isLoaded;
    setTimeout(() => didTimeout = true, 30000);

    while (!isLoaded && !didTimeout) {
      isLoaded = await new Promise((resolve) => {
        setTimeout(() => resolve(page.isLoaded), 50);
      });
    }

    if (!isLoaded && didTimeout) {
      throw new Error('load timed out');
    }
  }

  async renderPage(page, json = {}) {
    json.id = page.id;

    return this._makeRequest('renderPage', {
      method: 'POST',
      body: json
    });
  }

  async unloadPage(page, json = {}) {
    let response;

    json.id = page.id;

    response = await this._makeRequest('unloadPage', {
      method: 'POST',
      body: json
    });

    if (response === null || response === undefined || response === '') {
      return true;
    }
  }

  async _makeRequest(path, options = {}) {
    try {
      let url = `${this.url}/${path}`;
      let response = this.constructor.request(url, defaults(options, {
        json: true
      }));

      let { headers, statusCode, body } = await response;

      this.isBooted = headers['server'] === 'render-vendor';
      statusCode = Number(statusCode);

      switch (true) {
        case statusCode >= 200 && statusCode < 300:
          return body;
        case statusCode >= 300 && statusCode < 400:
          return headers['location'];
        default:
          throw new this.constructor.Error.UnexpectedResponse(response);
      }
    } catch (err) {
      console.error(err);
    }
  }

  _spawnPhantom({ bin = phantomjs.path, binArgs = [] } = this) {
    let phantom = childProcess.spawn(bin, [...binArgs, PHANTOM_SCRIPT]);

    phantom.stdout.on('data', this._handleStdOut.bind(this));
    phantom.stderr.on('data', this._handleStdErr.bind(this));
    phantom.on('exit', this.destroy.bind(this));

    return phantom;
  }

  _handleStdOut(buffer) {
    let message = buffer.toString() || 'could not read buffer';
    let isSentinel = Object.values(SENTINELS)
      .some((sentinel) => message.startsWith(`${sentinel}\n`));

    if (isSentinel) {
      let sentinelIndex = message.indexOf('\n');
      let sentinel = message.slice(0, sentinelIndex);
      let data = message.slice(sentinelIndex).trim();

      switch (sentinel) {
        case SENTINELS.didBoot:
        case SENTINELS.willBoot:
          let isDid = sentinel === SENTINELS.didBoot;

          this[`${isDid ? 'isBooted' : 'isBooting'}`] = data === 'true';
          break;

        case SENTINELS.didLoadPage:
        case SENTINELS.willLoadPage:
          let page = this.pages.find(({ id }) => id === data);

          if (page !== undefined) {
            let isDid = sentinel === SENTINELS.didLoadPage;

            page[`${isDid ? 'isLoaded' : 'isLoading'}`] = true;
          }
          break;
      }
    } else {
      this.emit('message', message);
    }
  }

  _handleStdErr(buffer) {
    this.emit('error', buffer.toString() || 'could not read buffer');
  }
}

PhantomRenderer.Error = class PhantomRendererError extends Error {};
PhantomRenderer.Error.UnexpectedResponse =
  class UnexpectedResponseError extends PhantomRenderer.Error {
    toString() {
      let { statusCode, body, request: { url } } = this.message;

      return `${this.name}: HTTP${statusCode} - ${url}:\n${body}`;
    }
  };

export default PhantomRenderer;
