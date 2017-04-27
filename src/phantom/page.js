import system from 'system';
import webpage from 'webpage';

// n.b. Phantom's require uses a different resolver, so we concat to libraryPath
const Logger = require(`${phantom.libraryPath}/utils/logger`).default;
const PhantomError = require(`${phantom.libraryPath}/utils/error`).default;

const logger = new Logger('Page');

export default class Page {
  constructor() {
    this.page = webpage.create();
    this.canPrint = false;

    this.page.onError = (msg, trace) => {
      let error = new PhantomError(msg, trace);
      logger.error(error);
    };

    this.page.onLoadFinished = () => {
      this.canPrint = true;
    };
  }

  load({ url, html }) {
    this.canPrint = false;

    if (html && html.constructor === String) {
      this.page.setContent(html, null);
    } else if (url && url.constructor === String) {
      this.page.open(url);
    } else {
      throw new Error('must pass either `url` or `html` option');
    }
  }

  render({ filename, type = 'pdf', quality = '75', paperOptions = {} } = {}) {
    filename = filename ||
      `/tmp/render-vendor-${system.pid}/${Date.now()}.${type}`;

    if (!this.canPrint) {
      throw new Error('no can print right now');
    }

    // n.b. paperSize must be set before render
    this.page.paperSize = Page.computePaperSize(this.page, paperOptions);
    this.page.render(filename, { type, quality });

    return filename;
  }
}

Page.computePaperSize = function computePaperSize(page, options) {
  let content = Page.getPageContent(page);
  let paper = { margin: options.margin || '0' };

  if (options.height !== undefined && options.width !== undefined) {
    paper.width = options.width;
    paper.height = options.height;
  } else if (options.isSinglePage === true) {
    let { width, height } = page.evaluate((heightMultiplier) => {
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

      paper[name] = Page.getPageSection(defaultContent, option, styles);

      if (paper[name].height === undefined) {
        paper[name].height = name === 'header' ? '46mm' : '28mm';
      }
    }
  });

  return paper;
};

Page.getPageContent = function getPageContent(page) {
  return page.evaluate(() => {
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
};

Page.getPageSection = function getPageSection(defaultContent, option, styles) {
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
};
