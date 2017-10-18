import EventEmitter from 'events';

import _ from 'lodash';
import assert from 'assert';

import Page from './page';
import makeErrorType from './utils/make-error-type';

const {
  defaults,
  isBoolean,
  isString
} = _;

let defaultRenderer;

export class Renderer extends EventEmitter {
  static get rendererConstructor() {
    return this._rendererConstructor || require('./renderers/chrome').default;
  }

  static set rendererConstructor(value) {
    this._rendererConstructor = value;
  }

  static get renderer() {
    if (defaultRenderer === undefined) {
      defaultRenderer = new this.rendererConstructor();
    }

    return defaultRenderer;
  }

  static set renderer(value) {
    defaultRenderer = value;
  }

  constructor(attrs = {}) {
    super();

    this.pages = [];
    defaults(this, attrs);
  }

  get isBooting() {
    return this._isBooting || false;
  }

  set isBooting(value) {
    assert.ok(isBoolean(value));
    assert.ok(!this.isShuttingDown);

    this._isBooted = false;
    this._isBooting = value;
  }

  get isBooted() {
    return this._isBooted || false;
  }

  set isBooted(value) {
    assert.ok(isBoolean(value));

    this._isBooting = false;
    this._isBooted = value;
    this._isShuttingDown = false;
  }

  get isShuttingDown() {
    return this._isShuttingDown || false;
  }

  set isShuttingDown(value) {
    assert.ok(isBoolean(value));
    assert.ok(this.isBooted === value);

    this._isShuttingDown = value;
  }

  get pages() {
    return this._pages;
  }

  set pages(value) {
    assert.ok(this._pages === undefined);
    this._pages = value;
  }

  find(id) {
    return this.pages.find((page) => page.id === id);
  }

  async load(id, options = {}) {
    assert.ok(id !== undefined);

    let page = this.find(id);

    if (page === undefined) {
      page = new Page({ id, renderer: this });
      this.pages.push(page);
    }

    return page.load(options);
  }

  async refresh() {
    try {
      let pages = await Page.all({ renderer: this });

      pages.forEach((_page) => {
        let page = this.find(_page.id);

        if (page === undefined) {
          page = _page;
          this.pages.push(page);
        }

        page.isLoaded = true;
      });
    } catch (err) {
      // nop
    }
  }

  async destroy() {
    if (!this.isBooted) {
      return;
    }

    this.isShuttingDown = true;
    this.removeAllListeners();

    await this.shutdown();

    this.pages.splice(0, this.pages.length);
    this.isBooted = false;
  }

  async _exec(command, page, ...args) {
    assert.ok(isString(command));
    assert.ok(page instanceof Page);
    assert.ok(!page.isDestroyed);
    assert.ok(!page.isDestroying || command === 'unload');

    if (!this.isBooted) {
      await this.boot();
    }

    return this[`${command}Page`].call(this, page, ...args);
  }

  // MARK - abstract api
  async boot() {
    throw new Renderer.Error.NotImplemented();
  }

  async shutdown() {
    throw new Renderer.Error.NotImplemented();
  }

  async ping() {
    throw new Renderer.Error.NotImplemented();
  }

  async loadPage(page, ...args) {
    throw new Renderer.Error.NotImplemented();
  }

  async renderPage(page, ...args) {
    throw new Renderer.Error.NotImplemented();
  }

  async unloadPage(page, ...args) {
    throw new Renderer.Error.NotImplemented();
  }

  // MARK - static API
  static get isBooting() {
    return this.renderer.isBooting;
  }

  static get isBooted() {
    return this.renderer.isBooted;
  }

  static get pages() {
    return this.renderer.pages;
  }

  static find() {
    return this.renderer.find(...arguments);
  }

  static async load() {
    return this.renderer.load(...arguments);
  }

  static async refresh() {
    return this.renderer.refresh(...arguments);
  }

  static async destroy() {
    return this.renderer.destroy(...arguments);
  }
}

export default Renderer;

Renderer.Error = makeErrorType('RendererError');
Renderer.Error.NotImplemented =
  makeErrorType('NotImplementedError', Renderer.Error);
