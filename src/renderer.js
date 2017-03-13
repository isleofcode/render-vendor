import _ from 'lodash';
import assert from 'assert';
import request from 'request';
import RSVP from 'rsvp';

import Phantom from './phantom';

const { denodeify } = RSVP;

export default class Renderer {
  constructor({ phantomOptions = {}, port, url, html } = {}) {
    assert.ok(port, 'missing `port`');
    assert.ok(url || html, 'missing either `url` or `html`');

    this.phantom = new Phantom(phantomOptions);
    this.port = this.phantom.startServer({ port, url, html });
  }

  render(options = {}) {
    let renderJob = this._renderJob || this._render(options);
    return renderJob;
  }

  _render(renderOptions) {
    this._renderJob = this._exec({
      command: 'render',
      options: {
        body: renderOptions
      }
    })
      .then((response) => {
        if (response.statusCode !== 303) {
          let res = JSON.stringify(response);
          throw new Error(`Renderer - Unexpected Response: ${res}`);
        }

        return response.body;
      })
      .catch((err) => {
        if (err instanceof Error) {
          throw err;
        } else {
          throw new Error(`Renderer - RenderError: ${err}`);
        }
      })
      .finally(() => {
        this._renderJob = null;
      });

    return this._renderJob;
  }

  shutdown() {
    this.phantom.shutdown();
  }

  _exec({ command, options = {} }) {
    assert.ok('command', 'missing command');

    const post = denodeify(request.post);
    let url = `http://localhost:${this.port}/${command}`;

    return post(url, _.defaults(options, {
      json: true
    }));
  }
}
