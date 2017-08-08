import system from 'system';
import webpage from 'webpage';

// n.b. Phantom's require uses a different resolver, so we concat to libraryPath
const { SENTINELS } = require(`${phantom.libraryPath}/utils/sentinels`);
const { Logger } = require(`${phantom.libraryPath}/utils/logger`);
const { PhantomError } = require(`${phantom.libraryPath}/utils/error`);

const logger = new Logger('Page');

export class Page {
  constructor(id = Math.random().toString(36).substring(10)) {
    this.id = id;
    this.page = this._createPage();
  }

  get html() {
    return this.page.content;
  }

  set html(value) {
    this.page.setContent(value, null);
  }

  get url() {
    return this.page.url;
  }

  set url(value) {
    this.page.open(value);
  }

  load({ dpi, viewportSize, zoomFactor, url, html } = {}) {
    if (dpi !== undefined) {
      this.dpi = dpi;
    }

    if (viewportSize !== undefined) {
      this.viewportSize = viewportSize;
    }

    if (zoomFactor !== undefined) {
      this.zoomFactor = zoomFactor;
    }

    if (html && html.constructor === String) {
      this.html = html;
    } else if (url && url.constructor === String) {
      this.url = url;
    }
  }

  render({ filename, format = 'pdf', quality = '75', paperSize = {} } = {}) {
    if (filename === undefined || filename === null) {
      filename = `/tmp/render-vendor-${system.pid}/${Date.now()}.${format}`;
    }

    // n.b. paperSize must be set before render
    this.page.paperSize = this._computePaperSize(paperSize);
    this.page.render(filename, {
      type: format,
      quality
    });

    return filename;
  }

  destroy() {
    this.page.close();
  }

  _createPage() {
    let { didLoadPage, willLoadPage } = SENTINELS;
    let page = webpage.create();

    page.onError = (msg, trace) => {
      logger.error(new PhantomError(msg, trace));
    };

    page.onLoadStarted = () => {
      logger.emit(willLoadPage, this.id);
    };

    page.onLoadFinished = () => {
      logger.emit(didLoadPage, this.id);
    };

    page.onResourceError = ({ url, errorCode, errorString }) => {
      logger.error(`resource error: ${url} - ${errorCode} ${errorString}`);
    };

    page.onResourceReceived = ({ url }) => {
      logger.info(`resource received: ${url}`);
    };

    page.onResourceRequested = ({ url }) => {
      logger.info(`resource requested: ${url}`);
    };

    page.onResourceTimeout = ({ url, errorCode, errorString }) => {
      logger.error(`resource timeout: ${url} - ${errorCode} ${errorString}`);
    };

    page.onConsoleMessage = (msg, lineNum, sourceId) => {
      logger.info(`CONSOLE: ${msg} (from line ${sourceId}:${lineNum})`);
    }

    return page;
  }

  _computePaperSize(options) {
    let content = this._getPageContent();
    let paper = { margin: options.margin || '0' };

    if (options.height !== undefined && options.width !== undefined) {
      paper.width = options.width;
      paper.height = options.height;
    } else if (options.isSinglePage === true) {
      let { width, height } = this.page.evaluate((heightMultiplier) => {
        let body = document.getElementsByTagName('body')[0];

        return {
          width: body.scrollWidth,
          height: body.scrollHeight * heightMultiplier
        };
      }, options.singlePageHeightMultiplier || 1.31);

      paper.width = options.width || width;
      paper.height = options.height || height;
    } else {
      paper.format = options.format || 'A4';
      paper.orientation = options.orientation || 'portrait';
    }

    Array.prototype.forEach.call(['header', 'footer'], (name) => {
      if (options[name] || content[name]) {
        let defaultContent = content[name] || {};
        let option = options[name] || {};
        let styles = content.styles;

        paper[name] = this._getPageSection(defaultContent, option, styles);

        if (paper[name].height === undefined) {
          paper[name].height = name === 'header' ? '46mm' : '28mm';
        }
      }
    });

    return paper;
  }

  _getPageContent() {
    return this.page.evaluate(() => {
      const getElements = function getElements(doc, wildcard) {
        let wildcardMatcher = new RegExp(`${wildcard}(.*)`);
        let hasElements = false;
        let elements = {};
        let $elements = doc.querySelectorAll(`[id*='${wildcard}']`);

        Array.prototype.forEach.call($elements, ($elem) => {
          let match = $elem.attributes.id.value.match(wildcardMatcher);

          if (match) {
            hasElements = true;
            elements[match[1]] = $elem.outerHTML;
            $elem.parentNode.removeChild($elem);
          }
        });

        return hasElements ? elements : {};
      };

      const getElement = function getElement(doc, id) {
        let $elem = doc.getElementById(id);
        let html;

        if ($elem) {
          html = $elem.outerHTML;
          $elem.parentNode.removeChild($elem);
        }

        return html;
      };

      let styles = Array.prototype.reduce.call(
        document.querySelectorAll('link,style'),
        (string, node) => string + (node.outerHTML || ''),
        ''
      );

      // Wildcard headers e.g. <div id="pageHeader-[first|0]">
      let header = getElements(document, 'pageHeader-');
      let footer = getElements(document, 'pageFooter-');

      // Default header and footer e.g. <div id="pageHeader">
      let h = getElement(document, 'pageHeader');
      let f = getElement(document, 'pageFooter');

      let $body = document.getElementById('pageContent');
      let body = $body !== null ? $body.outerHTML : document.body.outerHTML;

      if (h) {
        header.default = h;
      }

      if (f) {
        footer.default = f;
      }

      return { styles, header, body, footer };
    });
  }

  _getPageSection(defaultContent, option, styles) {
    let optionContent = option.contents;

    if (typeof optionContent !== 'object') {
      optionContent = { default: optionContent };
    }

    function readSectionValue(key) {
      return optionContent[key] || defaultContent[key];
    }

    return {
      height: option.height,
      contents: phantom.callback((pageNum, numPages) => {
        let html = readSectionValue(pageNum);

        if (pageNum === 1 && !html) {
          html = readSectionValue('first');
        }

        if (pageNum === numPages && !html) {
          html = readSectionValue('last');
        }

        return (html || readSectionValue(pageNum) || '')
          .replace(/\$page/g, pageNum)
          .replace(/\$numPages/g, numPages)
          .concat(styles);
      })
    };
  }
}

export default Page;
