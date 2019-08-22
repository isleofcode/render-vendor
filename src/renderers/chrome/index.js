import _ from 'lodash';
import path from 'path';
import puppeteer from 'puppeteer';

import Renderer from '../../renderer';

const { isString } = _;

const DEFAULT_BOOT_OPTIONS = {}; // use puppeteer defaults, https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions

export class ChromeRenderer extends Renderer {
  static get DEFAULT_BOOT_OPTIONS() {
    return this._DEFAULT_BOOT_OPTIONS || DEFAULT_BOOT_OPTIONS;
  }

  static set DEFAULT_BOOT_OPTIONS(value) {
    this._DEFAULT_BOOT_OPTIONS = value;
  }

  static get pagePathParamKey() {
    return 'path';
  }

  constructor(attrs = {}) {
    super(attrs);

    this.bootOptions = this.bootOptions ||
      this.constructor.DEFAULT_BOOT_OPTIONS;
  }

  get browser() {
    return this._browser;
  }

  set browser(value) {
    this._browser = value;
  }

  get bootOptions() {
    return this._bootOptions;
  }

  set bootOptions(value) {
    this._bootOptions = value;
  }

  async boot() {
    if (this.isBooted) {
      return;
    }

    try {
      if (!this.isBooting) {
        let bootOptions = this.bootOptions;

        this.isBooting = true;
        this.browser = bootOptions.hasOwnProperty('browserWSEndpoint') ?
          await puppeteer.connect(bootOptions) :
          await puppeteer.launch(bootOptions);

        this.isBooted = true;
      }
    } catch (err) {
      this.isBooted = false;
      throw err;
    }
  }

  async shutdown() {
    let browser = this.browser;

    if (browser !== null && browser !== undefined) {
      browser.close();
      this.browser = undefined;
    }

    this.isBooted = false;
  }

  async ping() {
    return this.browser.pages();
  }

  async loadPage(page, options) {
    let chromePage = page._chromePage;

    if (chromePage === null || chromePage === undefined) {
      chromePage = await this.browser.newPage();
      page._chromePage = chromePage;
    }

    page.isLoading = true;

    try {
      let { url, html } = options;

      if (html !== undefined && html !== null) {
        await chromePage.setContent(html);
      } else {
        if (url !== undefined && url !== null) {
          delete options.url;
        } else {
          url = page.id;
        }

        await chromePage.goto(url, options);
      }

      page.isLoaded = true;
    } catch (err) {
      page.isLoaded = false;
      throw err;
    }
  }

  async renderPage(page, options = {}) {
    let { path: filepath, type, waitForNavigation } = options;
    let buffer;

    if (!isString(type)) {
      type = isString(filepath) ? path.extname(filepath).slice(1) : 'html';
      type = type.length > 0 ? type : 'html';
    }

    if (waitForNavigation !== null && waitForNavigation !== undefined) {
      if (waitForNavigation === false) {
        return;
      } else if (waitForNavigation === Object(waitForNavigation)) {
        await page._chromePage.waitForNavigation(waitForNavigation);
      } else {
        await page._chromePage.waitForNavigation({
          waitUntil: 'networkidle',
          networkIdleInflight: 0,
          timeout: 0
        });
      }
      delete options.waitForNavigation;
    }

    switch (type) {
      case 'html':
        buffer = await page._chromePage.content();
        break;
      case 'pdf':
        let { emulateMedia } = options;

        if (emulateMedia !== null && emulateMedia !== undefined) {
          await page._chromePage.emulateMedia(emulateMedia);
          delete options.emulateMedia;
        }

        buffer = await page._chromePage.pdf(options);
        break;
      default:
        buffer = await page._chromePage.screenshot(options);
        break;
    }

    return isString(filepath) ? filepath : buffer;
  }

  async unloadPage(page, ...args) {
    await page._chromePage.close();

    return true;
  }
}

export default ChromeRenderer;
