import webserver from 'webserver';

// n.b. Phantom's require uses a different resolver, so we libraryPath
const Page = require(`${phantom.libraryPath}/page`).default;
const Logger = require(`${phantom.libraryPath}/utils/logger`).default;

const logger = new Logger('Server');

export default class Server {
  constructor(pageOptions = {}) {
    this.server = webserver.create();
    this.page = new Page(pageOptions);
  }

  /* eslint-disable no-param-reassign */
  start({ port = 8180, url, html, dpi, viewportSize, zoomFactor } = {}) {
    if (dpi !== undefined) {
      this.page.dpi = dpi;
    }

    if (viewportSize !== undefined) {
      this.page.viewportSize = viewportSize;
    }

    if (zoomFactor !== undefined) {
      this.page.zoomFactor = zoomFactor;
    }

    this.page.load({ url, html });
    this.server.listen(port, (request, response) => {
      try {
        if (request.url === '/render' && request.method === 'POST') {
          let options = JSON.parse(request.post || '');
          let filename = this.page.render(options);

          response.statusCode = 303;
          response.write(filename);
        } else {
          response.statusCode = 404;
          response.write('');
        }
      } catch (error) {
        response.statusCode = 500;
        response.write(error.message || error || JSON.stringify(error));

        logger.error(JSON.stringify(response));
      }

      response.close();
    });
  }
  /* eslint-enable no-param-reassign */

  stop() {
    this.server.close();
    phantom.exit(null);
  }
}
