import _ from 'lodash';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import td from 'testdouble';

import Page from '../src/page';
import Renderer from '../src/renderer';
import PhantomRenderer from '../src/renderers/phantom';

import INVALID_VALUES from './helpers/invalid-values';
import testAsyncFunctionThrows from './helpers/test-async-function-throws';

chai.use(chaiAsPromised);

const { clone } = _;

describe('Renderer', function() {
  afterEach(function() {
    td.reset();
  });

  describe('.rendererConstructor', function() {
    context('when not overridden', function() {
      beforeEach(function() {
        Renderer.rendererConstructor = undefined;
      });

      it('defaults to phantom renderer', function() {
        expect(Renderer.rendererConstructor).to.equal(PhantomRenderer);
      });
    });

    context('when overridden', function() {
      beforeEach(function() {
        Renderer.rendererConstructor = Renderer;
      });

      it('returns the new value', function() {
        expect(Renderer.rendererConstructor).to.equal(Renderer);
      });

      context('when unset again', function() {
        beforeEach(function() {
          Renderer.rendererConstructor = undefined;
        });

        it('resets to default', function() {
          expect(Renderer.rendererConstructor).to.equal(PhantomRenderer);
        });
      });
    });
  });

  describe('.renderer', function() {
    before(function() {
      // n.b. relying on Phantom here leads to circular import issues
      //      (in test suite only)
      Renderer.rendererConstructor = Renderer;
    });

    beforeEach(function() {
      Renderer.renderer = undefined;
    });

    context('when not overridden', function() {
      it('constructs a new renderer with `.rendererConstructor`', function() {
        expect(Renderer.renderer)
          .to.be.instanceof(Renderer.rendererConstructor);
      });
    });

    context('when overridden', function() {
      let renderer = new Renderer();

      beforeEach(function() {
        Renderer.renderer = renderer;
      });

      it('returns the new value', function() {
        expect(Renderer.renderer).to.equal(renderer);
      });

      context('when unset again', function() {
        beforeEach(function() {
          Renderer.renderer = undefined;
        });

        it('constructs a new renderer again', function() {
          expect(Renderer.renderer).not.to.equal(renderer);
          expect(Renderer.renderer)
            .to.be.instanceof(Renderer.rendererConstructor);
        });
      });
    });
  });

  describe('.init', function() {
    let renderer;

    context('when provided with addl attrs', function() {
      let additionalAttrs = {
        additional2: 2,
        foo: 'bar',
        magic: 'michael'
      };

      beforeEach(function() {
        renderer = new Renderer(additionalAttrs);
      });

      it('sets an empty pages array', function() {
        expect(renderer.pages).to.deep.equal([]);
      });

      Object.keys(additionalAttrs).forEach((key) => {
        it(`sets ${key}`, function() {
          expect(renderer[key]).to.equal(additionalAttrs[key]);
        });
      });
    });

    context('when not provided with addl attrs', function() {
      beforeEach(function() {
        renderer = new Renderer();
      });

      it('sets an empty pages array', function() {
        expect(renderer.pages).to.deep.equal([]);
      });
    });
  });

  // todo isShuttingDown + contexts
  describe('#isBooting', function() {
    let renderer = new Renderer();

    context('when `#isBooted === true`', function() {
      beforeEach(function() {
        renderer.isBooted = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          renderer.isBooting = true;
        });

        it('returns true', function() {
          expect(renderer.isBooting).to.equal(true);
        });

        it('resets `#isBooted` to false', function() {
          expect(renderer.isBooted).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          renderer.isBooting = false;
        });

        it('returns false', function() {
          expect(renderer.isBooting).to.equal(false);
        });

        it('resets `#isBooted` to false', function() {
          expect(renderer.isBooted).to.equal(false);
        });
      });

      context('and setting an invalid value', function() {
        INVALID_VALUES.boolean.forEach((invalid) => {
          context(`(${invalid})`, function() {
            testAsyncFunctionThrows('AssertionError', () => {
              renderer.isBooting = invalid;
            });
          });
        });
      });
    });
  });

  describe('#isBooted', function() {
    let renderer = new Renderer();

    context('when `#isBooting === true`', function() {
      beforeEach(function() {
        renderer.isBooting = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          renderer.isBooted = true;
        });

        it('returns true', function() {
          expect(renderer.isBooted).to.equal(true);
        });

        it('resets `#isBooting` to false', function() {
          expect(renderer.isBooting).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          renderer.isBooted = false;
        });

        it('returns false', function() {
          expect(renderer.isBooted).to.equal(false);
        });

        it('resets `#isBooting` to false', function() {
          expect(renderer.isBooting).to.equal(false);
        });
      });

      context('and setting an invalid value', function() {
        INVALID_VALUES.boolean.forEach((invalid) => {
          context(`(${invalid})`, function() {
            testAsyncFunctionThrows('AssertionError', () => {
              renderer.isBooted = invalid;
            });
          });
        });
      });
    });
  });

  describe('#pages', function() {
    context('when called by init', function() {
      let renderer = new Renderer();

      it('sets to an empty array', function() {
        expect(renderer.pages).to.deep.equal([]);
      });

      context('when called again after', function() {
        testAsyncFunctionThrows('AssertionError', () => renderer.pages = []);
      });
    });
  });

  describe('#find', function() {
    let id = '1';
    let renderer;

    beforeEach(function() {
      renderer = new Renderer();
    });

    context('when a page with the passed id exists', function() {
      let page;

      beforeEach(function() {
        page = new Page({ id, renderer });
        renderer.pages.push(page);
      });

      it('returns the page instance', function() {
        expect(renderer.find(id)).to.equal(page);
      });
    });

    context('when a page with the passed id does not exist', function() {
      it('returns undefined', function() {
        expect(renderer.find(id)).to.equal(undefined);
      });
    });
  });

  describe('#load', function() {
    let renderer;

    beforeEach(function() {
      renderer = new Renderer();
    });

    context('when called without an id', function() {
      testAsyncFunctionThrows('AssertionError', () => renderer.load());
    });

    context('when called with an id', function() {
      let id = '1';
      let pageLoad;

      context('and an options hash', function() {
        let options = { opt1: 1, opt2: 2 };

        context('and a previously-rendered Page shares the id', function() {
          let page;

          beforeEach(async function() {
            page = new Page({ id, renderer });
            renderer.pages.push(page);

            pageLoad = td.replace(page, 'load');

            await renderer.load(id, options);
          });

          it('reloads the previous page with the provided options', function() {
            td.verify(pageLoad(options));
          });
        });

        context('and no previously-rendered Page shares the id', function() {
          let initialPages;

          beforeEach(async function() {
            initialPages = clone(renderer.pages);
            pageLoad = td.replace(Page.prototype, 'load');

            await renderer.load(id, options);
          });

          it('creates a new Page with `id` & adds it to `#pages`', function() {
            expect(initialPages.map((page) => page.id)).not.to.include(id);
            expect(renderer.pages.map((page) => page.id)).to.include(id);
          });

          it('loads the page with the provided options', function() {
            td.verify(pageLoad(options));
          });
        });
      });
    });
  });

  describe('#refresh', function() {
    let renderer;
    let pageAll;

    beforeEach(function() {
      renderer = new Renderer();
      pageAll = td.replace(Page, 'all');
    });

    context('when `Page.all` returns page objects', function() {
      let pages;
      beforeEach(function() {
        pages = [
          new Page({ renderer, id: '1' }),
          new Page({ renderer, id: '2', isLoading: true }),
          new Page({ renderer, id: '3', isLoaded: true })
        ];

        td.when(pageAll({ renderer }))
          .thenReturn(pages);
      });

      context('and some have not yet been loaded into `#pages`', function() {
        let initialPages;

        beforeEach(async function() {
          initialPages = clone(renderer.pages);

          renderer.pages.push(pages[1]);
          renderer.pages.push(pages[2]);

          await renderer.refresh();
        });

        it('adds the missing pages to #pages', function() {
          expect(initialPages.length).to.be.lessThan(renderer.pages.length);

          pages.forEach((page) => {
            expect(renderer.pages).to.include(page);
          });
        });

        it('marks all pages as loaded', function() {
          pages.forEach((page) => {
            expect(page.isLoaded).to.equal(true);
          });
        });
      });
    });

    context('when `Page.all` throws', function() {
      let error;

      beforeEach(async function() {
        td.when(pageAll({ renderer }))
          .thenThrow(new Error());

        try {
          await renderer.refresh();
        } catch (err) {
          error = err;
        }
      });

      it('suppresses the error and fails gracefully', function() {
        expect(error).to.equal(undefined);
      });
    });
  });

  describe('#destroy', function() {
    let renderer = new Renderer();
    let pages = [
      new Page({ renderer, id: '1' }),
      new Page({ renderer, id: '2' })
    ];

    let shutdown;

    beforeEach(async function() {
      shutdown = td.replace(renderer, 'shutdown');

      renderer.isBooted = true;
      pages.forEach((page) => renderer.pages.push(page));

      await renderer.destroy();
    });

    // todo isShuttingDown
    // todo removeAllListeners
    // todo isBooted at the end
    it('rms all owned pages', function() {
      expect(renderer.pages.length).to.equal(0);
    });

    it('calls to `shutdown()`', function() {
      td.verify(shutdown());
    });
  });

  describe('#_exec', function() {
    let renderer = new Renderer();

    context('when passed a command that is not a string', function() {
      let page = new Page({ id: '1', renderer });

      INVALID_VALUES.string.forEach((invalid) => {
        context(`(${invalid})`, function() {
          testAsyncFunctionThrows('AssertionError', () => {
            return renderer._exec(invalid, page);
          });
        });
      });
    });

    context('when passed a valid command', function() {
      let command;

      beforeEach(function() {
        command = 'foo'
      });

      context('and passed an invalid `page`', function() {
        INVALID_VALUES.page.forEach((invalid) => {
          context(`(${invalid})`, function() {
            testAsyncFunctionThrows('AssertionError', () => {
              return renderer._exec(command, invalid);
            });
          });
        });
      });

      context('and passed a valid `page`', function() {
        let page;

        beforeEach(function() {
          page = new Page({ renderer, id: '1' });
        });

        context('and page is destroying', function() {
          beforeEach(function() {
            page.isDestroying = true;
          });

          context('and command is `unload`', function() {
            beforeEach(function() {
              command = 'unload';
            });

            testValidState();
          });

          context('and command is not `unload`', function() {
            testAsyncFunctionThrows('AssertionError', () => {
              return renderer._exec(command, page);
            });
          });
        });

        context('and page is destroyed', function() {
          beforeEach(function() {
            page.isDestroyed = true;
          });

          testAsyncFunctionThrows('AssertionError', () => {
            return renderer._exec(command, page);
          });
        });

        context('and page is neither destroyed nor destroying', function() {
          testValidState();
        });

        function testValidState() {
          let boot;
          let commandPage;

          beforeEach(function() {
            boot = td.replace(renderer, 'boot');
            commandPage = td.replace(renderer, `${command}Page`, td.function());
          });

          context('and renderer is booted', function() {
            let args = [1, 2, 3];

            beforeEach(async function() {
              renderer.isBooted = true;

              await renderer._exec(command, page, ...args)
            });

            it('does not call to boot', function() {
              td.verify(boot(), { times: 0 });
            });

            it('proxies to `${command}Page`', function() {
              td.verify(commandPage(page, ...args));
            });
          });

          context('and renderer is not yet booted', function() {
            beforeEach(async function() {
              renderer.isBooted = false;

              await renderer._exec(command, page);
            });

            it('calls to boot renderer', function() {
              td.verify(boot());
            });

            it('proxies to `${command}Page`', function() {
              td.verify(commandPage(page));
            });
          });
        }
      });
    });
  });

  describe('abstract methods:', function() {
    const ABSTRACT_METHODS = [
      'boot',
      'shutdown',
      'ping',
      'loadPage',
      'renderPage',
      'unloadPage'
    ];

    let renderer = new Renderer();

    ABSTRACT_METHODS.forEach((method) => {
      describe(`#${method}`, function() {
        let error;

        beforeEach(async function() {
          try {
            await renderer[method]();
          } catch (err) {
            error = err;
          }
        });

        it('throws a NotImplementedError instance', function() {
          expect(error).to.be.instanceof(Renderer.Error.NotImplemented);
        });
      });
    });
  });

  describe('static proxies', function() {
    const STATIC_GETTERS = [
      'isBooting',
      'isBooted',
      'pages'
    ]

    const STATIC_METHODS = [
      'find',
      'load',
      'refresh',
      'destroy',
    ];

    STATIC_GETTERS.forEach((getter) => {
      describe(`.${getter}`, function() {
        it('is not undefined', function() {
          expect(Renderer[getter]).not.to.equal(undefined);
        });

        it('proxies to #renderer instance', function() {
          expect(Renderer[getter]).to.equal(Renderer.renderer[getter]);
        });
      });
    });

    STATIC_METHODS.forEach((method) => {
      describe(`.${method}`, function() {
        let args = [1, 2, 3];
        let instanceMethod;

        beforeEach(async function() {
          instanceMethod = td.replace(Renderer.renderer, method);

          await Renderer[method](args);
        });

        it('proxies to renderer with provided args', function() {
          td.verify(instanceMethod(args));
        });
      });
    });
  });
});
