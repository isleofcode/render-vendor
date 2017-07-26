import webserver from 'webserver';

const { Page } = require(`${phantom.libraryPath}/page`);
const { SENTINELS } = require(`${phantom.libraryPath}/utils/sentinels`);
const { Logger } = require(`${phantom.libraryPath}/utils/logger`);
const arrayFindPolyfill =
  require(`${phantom.libraryPath}/utils/-array-find-polyfill`).default;

const logger = new Logger('Server');

let server;
let pages = [];

arrayFindPolyfill();

export class Server {
  get server() {
    if (server === undefined) {
      server = webserver.create();
    }

    return server;
  }

  get defaultResponseHeaders() {
    return {
      'server': 'render-vendor'
    };
  }

  get pages() {
    return pages;
  }

  get isBooting() {
    return this._isBooting || false;
  }

  get isBooted() {
    return this._isBooted || false;
  }

  set isBooting(value) {
    this._isBooted = false;
    this._isBooting = value;
  }

  set isBooted(value) {
    this._isBooting = false;
    this._isBooted = value;
  }

  boot(port) {
    let { didBoot, willBoot } = SENTINELS;

    if (this.isBooted) {
      logger.emit(didBoot, true);
      return;
    }

    logger.emit(willBoot, true);

    if (this.isBooting) {
      return;
    }

    this.isBooting = true;
    this.isBooted = this.server.listen(port, this.handleRequest.bind(this));

    logger.emit(didBoot, this.isBooted);
  }

  handleRequest(request, response) {
    let [, methodName] = request.url.split('/');
    let method = this[methodName].bind(this);

    try {
      let { statusCode = 200, headers = {}, body = '' } = method(request);

      response.statusCode = statusCode;
      response.headers = Object.assign(headers, this.defaultResponseHeaders);
      response.write(body);
    } catch (error) {
      switch (error.constructor) {
        case this.constructor.Error.PageNotFound:
          response.statusCode = 404;
          break;
        default:
          response.statusCode = 500;
      }

      response.headers = this.defaultResponseHeaders;
      response.write(`${error.toString()}:\n${error.stack}`);

      logger.error(error);
    }

    response.closeGracefully();
  }

  loadPage(request) {
    let json = JSON.parse(request.post || '{}');
    let { id } = json;
    let page;
    let statusCode;

    if (id !== undefined) {
      page = this._findPage(id);
    }

    if (page !== undefined) {
      statusCode = 202;
    } else {
      page = new Page(id);
      this.pages.push(page);

      statusCode = 201;
    }

    page.load(json);

    return {
      statusCode,
      body: JSON.stringify({ id: page.id }),
      headers: {
        'content-type': 'application/json'
      }
    };
  }

  renderPage(request) {
    let json = JSON.parse(request.post || '{}');
    let { id, format = 'html' } = json;
    let page = id !== undefined ? this._findPage(id) : undefined;

    if (page === undefined) {
      throw new this.constructor.Error.PageNotFound();
    }

    if (format === 'html') {
      return {
        body: page.html,
        headers: {
          'content-type': 'text/html'
        }
      }
    } else {
      let filename = page.render(json);

      return {
        statusCode: 303,
        headers: {
          'location': filename
        }
      };
    }
  }

  ping(request) {
    let body = JSON.stringify({
      ids: Array.prototype.map.call(this.pages, (page) => page.id)
    });

    return {
      body,
      headers: {
        'content-type': 'application/json'
      }
    };
  }

  unloadPage(request) {
    let { id } = JSON.parse(request.post || '{}');
    let page = id !== undefined ? this._findPage(id) : undefined;

    if (page === undefined) {
      throw new this.constructor.Error.PageNotFound();
    }

    page.destroy();
    this.pages.splice(this.pages.indexOf(page), 1);

    return { statusCode: 204 };
  }

  _findPage(id) {
    return Array.prototype.find.call(this.pages, (page) => page.id === id);
  }

  _kill() {
    this.server.close();
    phantom.exit(0);
  }
}

Server.Error = class ServerError extends Error {
  get name() { 'ServerError' }
}

Server.Error.UnknownMethod = class UnknownMethodError extends Server.Error {
  get name() { 'ServerError.UnknownMethod' }
}

Server.Error.PageNotFound = class PageNotFoundError extends Server.Error {
  get name() { 'ServerError.PageNotFound' }
}

export default Server;
