import _ from 'lodash';
import assert from 'assert';
import path from 'path';

import Renderer from './renderer';

const {
  defaults,
  isBoolean,
  isObject: isPresent,
  isString
} = _;

export class Page {
  static async all({ renderer } = {}) {
    assert.ok(renderer instanceof Renderer);

    let { ids = [] } = await renderer.ping();

    return ids.map((id) => new this({ id, renderer }));
  }

  constructor(attrs = {}) {
    assert.ok(isString(attrs.id));
    assert.ok(isPresent(attrs.renderer));

    defaults(this, attrs);
  }

  get isLoading() {
    return this._isLoading || false;
  }

  set isLoading(value) {
    assert.ok(isBoolean(value));

    this._isLoaded = false;
    this._isLoading = value;
  }

  get isLoaded() {
    return this._isLoaded || false;
  }

  set isLoaded(value) {
    assert.ok(isBoolean(value));

    this._isLoading = false;
    this._isLoaded = value;
  }

  get isDestroying() {
    return this._isDestroying || false;
  }

  set isDestroying(value) {
    assert.ok(isBoolean(value));

    this._isLoading = false;
    this._isLoaded = false;
    this._isDestroying = value;
  }

  get isDestroyed() {
    return this._isDestroyed || false;
  }

  set isDestroyed(value) {
    assert.ok(isBoolean(value));

    this._isLoading = false;
    this._isLoaded = false;
    this._isDestroying = false;
    this._isDestroyed = value;
  }

  get renderer() {
    return this._renderer;
  }

  set renderer(value) {
    assert.ok(this.renderer === undefined, 'cannot overwrite renderer');
    assert.ok(value instanceof Renderer, 'must set obj of type Renderer');

    this._renderer = value;
  }

  async load(options = {}) {
    assert.ok(!this.isDestroyed && !this.isDestroying);

    try {
      await this.renderer._exec('load', this, options);
    } catch (err) {
      this.isLoading = false;

      throw err;
    }

    return this;
  }

  async render(options = {}, ...args) {
    assert.ok(!this.isDestroyed && !this.isDestroying && this.isLoaded);

    if (isString(options)) {
      let filename = options;

      options = isPresent(args[0]) ? args[0] : {};
      options.filename = filename;
    }

    if (isString(options.filename) && !isString(options.format)) {
      let extname = path.extname(options.filename || '');

      if (extname.length > 1) {
        options.format = extname.slice(1);
      }
    }

    return await this.renderer._exec('render', this, options);
  }

  async destroy() {
    assert.ok(!this.isDestroying);

    this.isDestroying = true;

    try {
      this.isDestroyed = await this.renderer._exec('unload', this);

      if (this.isDestroyed) {
        this.renderer.pages.splice(this.renderer.pages.indexOf(this), 1);
      }
    } catch (err) {
      this.isDestroying = false;

      throw err;
    }
  }
}

export default Page;
