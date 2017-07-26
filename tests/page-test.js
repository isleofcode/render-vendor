import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import td from 'testdouble';

import Page from '../src/page';
import Renderer from '../src/renderer';

import INVALID_VALUES from './helpers/invalid-values';
import testAsyncFunctionThrows from './helpers/test-async-function-throws';

chai.use(chaiAsPromised);

describe('Page', function() {
  let page;

  function vendPage(attrs = {}) {
    return new Page(Object.assign({
      id: '1',
      renderer: new Renderer()
    }, attrs));
  }

  afterEach(function() {
    td.reset();
  });

  describe('.all', function() {
    context('when not passed a renderer', function() {
      testAsyncFunctionThrows('AssertionError', () => Page.all());
    });

    context('when passed a renderer', function() {
      let ids = ['1', '2', '3'];
      let pages;

      beforeEach(async function() {
        let renderer = new Renderer();
        let ping = td.replace(renderer, 'ping');

        td.when(ping()).thenResolve({ ids });

        pages = await Page.all({ renderer });
      });

      it('returns `Page` objs for ids returned by `renderer#ping`', function() {
        pages.forEach((page) => {
          expect(page).to.be.instanceof(Page);
        });

        expect(pages.map((page) => page.id))
          .to.deep.equal(ids);
      });
    });
  });

  describe('.init', function() {
    context('when passed an invalid id', function() {
      INVALID_VALUES.id.forEach((id) => {
        context(`(${id})`, function() {
          testAsyncFunctionThrows('AssertionError', () => vendPage({ id }));
        });
      });
    });

    context('when passed a valid id', function() {
      context('when passed an invalid renderer', function() {
        INVALID_VALUES.renderer.forEach((renderer) => {
          context(`(${renderer})`, function() {
            testAsyncFunctionThrows('AssertionError', () => {
              return vendPage({ renderer });
            });
          });
        });
      });

      context('when passed a valid renderer', function() {
        context('and any number of additional attrs', function() {
          let additionalAttrs = {
            additional1: 1,
            anotherAttr: true,
            thisCanBeAnything: 'for real'
          };

          before(function() {
            page = vendPage(additionalAttrs);
          });

          it('sets #id', function() {
            expect(page.id).to.be.a('string');
          });

          it('sets #renderer', function() {
            expect(page.renderer).to.be.instanceof(Renderer);
          });

          Object.keys(additionalAttrs).forEach((key) => {
            it(`sets #${key}`, function() {
              expect(page[key]).to.equal(additionalAttrs[key]);
            });
          });
        });
      });
    });
  });

  describe('#isLoading', function() {
    beforeEach(function() {
      page = vendPage();
    });

    context('when `#isLoaded === true`', function() {
      beforeEach(function() {
        page.isLoaded = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          page.isLoading = true;
        });

        it('returns true', function() {
          expect(page.isLoading).to.equal(true);
        });

        it('resets `#isLoaded` to false', function() {
          expect(page.isLoaded).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          page.isLoading = false;
        });

        it('returns false', function() {
          expect(page.isLoading).to.equal(false);
        });

        it('resets `#isLoaded` to false', function() {
          expect(page.isLoaded).to.equal(false);
        });
      });

      context('and setting an invalid value', function() {
        INVALID_VALUES.boolean.forEach((invalid) => {
          context(`(${invalid})`, function() {
            testAsyncFunctionThrows('AssertionError', () => {
              page.isLoading = invalid;
            });
          });
        });
      });
    });
  });

  describe('#isLoaded', function() {
    beforeEach(function() {
      page = vendPage();
    });

    context('when `#isLoading === true`', function() {
      beforeEach(function() {
        page.isLoading = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          page.isLoaded = true;
        });

        it('returns true', function() {
          expect(page.isLoaded).to.equal(true);
        });

        it('resets `#isLoading` to false', function() {
          expect(page.isLoading).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          page.isLoaded = false;
        });

        it('returns false', function() {
          expect(page.isLoaded).to.equal(false);
        });

        it('resets `#isLoading` to false', function() {
          expect(page.isLoading).to.equal(false);
        });
      });

      context('and setting an invalid value', function() {
        INVALID_VALUES.boolean.forEach((invalid) => {
          context(`(${invalid})`, function() {
            testAsyncFunctionThrows('AssertionError', () => {
              page.isLoaded = invalid;
            });
          });
        });
      });
    });
  });

  describe('#isDestroying', function() {
    context('when `#isLoading === true`', function() {
      beforeEach(function() {
        page.isLoading = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          page.isDestroying = true;
        });

        it('returns true', function() {
          expect(page.isDestroying).to.equal(true);
        });

        it('resets `#isLoading` to false', function() {
          expect(page.isLoading).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          page.isDestroying = false;
        });

        it('returns false', function() {
          expect(page.isDestroying).to.equal(false);
        });

        it('resets `#isLoading` to false', function() {
          expect(page.isLoading).to.equal(false);
        });
      });
    });

    context('when `#isLoaded === true`', function() {
      beforeEach(function() {
        page.isLoaded = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          page.isDestroying = true;
        });

        it('returns true', function() {
          expect(page.isDestroying).to.equal(true);
        });

        it('resets `#isLoaded` to false', function() {
          expect(page.isLoaded).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          page.isDestroying = false;
        });

        it('returns false', function() {
          expect(page.isDestroying).to.equal(false);
        });

        it('resets `#isLoaded` to false', function() {
          expect(page.isLoaded).to.equal(false);
        });
      });
    });

    context('and setting an invalid value', function() {
      INVALID_VALUES.boolean.forEach((invalid) => {
        context(`(${invalid})`, function() {
          testAsyncFunctionThrows('AssertionError', () => {
            page.isDestroying = invalid;
          });
        });
      });
    });
  });

  describe('#isDestroyed', function() {
    context('when `#isLoading === true`', function() {
      beforeEach(function() {
        page.isLoading = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          page.isDestroyed = true;
        });

        it('returns true', function() {
          expect(page.isDestroyed).to.equal(true);
        });

        it('resets `#isLoading` to false', function() {
          expect(page.isLoading).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          page.isDestroyed = false;
        });

        it('returns false', function() {
          expect(page.isDestroyed).to.equal(false);
        });

        it('resets `#isLoading` to false', function() {
          expect(page.isLoading).to.equal(false);
        });
      });
    });

    context('when `#isLoaded === true`', function() {
      beforeEach(function() {
        page.isLoaded = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          page.isDestroyed = true;
        });

        it('returns true', function() {
          expect(page.isDestroyed).to.equal(true);
        });

        it('resets `#isLoaded` to false', function() {
          expect(page.isLoaded).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          page.isDestroyed = false;
        });

        it('returns false', function() {
          expect(page.isDestroyed).to.equal(false);
        });

        it('resets `#isLoaded` to false', function() {
          expect(page.isLoaded).to.equal(false);
        });
      });
    });

    context('when `#isDestroying === true`', function() {
      beforeEach(function() {
        page.isDestroying = true;
      });

      context('and setting to true', function() {
        beforeEach(function() {
          page.isDestroyed = true;
        });

        it('returns true', function() {
          expect(page.isDestroyed).to.equal(true);
        });

        it('resets `#isDestroying` to false', function() {
          expect(page.isDestroying).to.equal(false);
        });
      })

      context('and setting to false', function() {
        beforeEach(function() {
          page.isDestroyed = false;
        });

        it('returns false', function() {
          expect(page.isDestroyed).to.equal(false);
        });

        it('resets `#isDestroying` to false', function() {
          expect(page.isDestroying).to.equal(false);
        });
      });
    });

    context('and setting an invalid value', function() {
      INVALID_VALUES.boolean.forEach((invalid) => {
        context(`(${invalid})`, function() {
          testAsyncFunctionThrows('AssertionError', () => {
            page.isDestroyed = invalid;
          });
        });
      });
    });
  });

  describe('#renderer', function() {
    context('when set by init', function() {
      context('to a valid value', function() {
        before(function() {
          page = vendPage();
        });

        it('sets #renderer', function() {
          expect(page.renderer).to.be.instanceof(Renderer);
        });

        context('when trying to overwrite', function() {
          testAsyncFunctionThrows('AssertionError', () => {
            page.renderer = new Renderer();
          });
        });
      });

      context('to an invalid value', function() {
        INVALID_VALUES.renderer.forEach((renderer) => {
          context(`(${renderer})`, function() {
            testAsyncFunctionThrows('AssertionError', () => {
              return vendPage({ renderer });
            });
          });
        });
      });
    });
  });

  describe('#load', function() {
    let page;
    let _exec;

    beforeEach(function() {
      page = vendPage();
      _exec = td.replace(page.renderer, '_exec');
    });

    context('when page `isDestroying`', function() {
      beforeEach(function() {
        page.isDestroying = true;
      });

      testAsyncFunctionThrows('AssertionError', () => page.load());

      it('does not call the exec proxy', async function() {
        try {
          await page.load();
        } catch (err) {
          // nop
        }

        expect(td.verify(_exec(), { ignoreExtraArgs: true, times: 0 }));
      });
    });

    context('when page `isDestroyed`', function() {
      beforeEach(function() {
        page.isDestroyed = true;
      });

      testAsyncFunctionThrows('AssertionError', () => page.load());

      it('does not call the exec proxy', async function() {
        try {
          await page.load();
        } catch (err) {
          // nop
        }

        expect(td.verify(_exec(), { ignoreExtraArgs: true, times: 0 }));
      });
    });

    context('when the proxied `#renderer#_exec` succeeds', function() {
      let result;

      beforeEach(async function() {
        td.when(_exec('load', page, td.matchers.anything()))
          .thenResolve()

        result = await page.load();
      });

      it('does not set `#isLoading` directly', function() {
        expect(page.isLoading).to.equal(false);
      });

      it('does not set `#isLoaded` directly', function() {
        expect(page.isLoaded).to.equal(false);
      });

      it('returns itself', function() {
        expect(result).to.equal(page);
      });
    });

    context('when the proxied `#renderer#_exec` throws', function() {
      let error = new Error();

      beforeEach(function() {
        td.when(_exec('load', page, td.matchers.anything()))
          .thenThrow(error)
      });

      testAsyncFunctionThrows(error, () => page.load());

      context('and `#isLoading` was true', function() {
        beforeEach(async function() {
          page.isLoading = true;

          try {
            await page.load();
          } catch (err) {
            // nop
          }
        });

        it('resets `#isLoading` to false', function() {
          expect(page.isLoading).to.equal(false);
        });
      });
    });
  });

  describe('#render', function() {
    let page;
    let _exec;

    beforeEach(function() {
      page = vendPage();
      _exec = td.replace(page.renderer, '_exec');
    });

    context('when page isDestroying', function() {
      beforeEach(function() {
        page.isDestroying = true;
      });

      testAsyncFunctionThrows('AssertionError', () => page.render());

      it('does not call the exec proxy', async function() {
        try {
          await page.render();
        } catch (err) {
          // nop
        }

        expect(td.verify(_exec(), { ignoreExtraArgs: true, times: 0 }));
      });
    });

    context('when page isDestroyed', function() {
      beforeEach(function() {
        page.isDestroyed = true;
      });

      testAsyncFunctionThrows('AssertionError', () => page.render());

      it('does not call the exec proxy', async function() {
        try {
          await page.render();
        } catch (err) {
          // nop
        }

        expect(td.verify(_exec(), { ignoreExtraArgs: true, times: 0 }));
      });
    });

    context('when page isLoading', function() {
      beforeEach(function() {
        page.isLoading = true;
      });

      testAsyncFunctionThrows('AssertionError', () => page.render());

      it('does not call the exec proxy', async function() {
        try {
          await page.render();
        } catch (err) {
          // nop
        }

        expect(td.verify(_exec(), { ignoreExtraArgs: true, times: 0 }));
      });
    });

    context('when page isLoaded', function() {
      beforeEach(function() {
        page.isLoaded = true;
      });

      context('when passed no arguments', function() {
        beforeEach(function() {
          page.render();
        });

        it('proxies to _exec with an empty options object', function() {
          td.verify(_exec('render', page, {}));
        });
      });

      context('when passed filename as the first argument', function() {
        context('for which the extension can be discerned', function() {
          let filename = 'doggie.pdf';

          context('and passed format in its options obj', function() {
            beforeEach(function() {
              page.render(filename, { format: 'png' });
            });

            it('does not overwrite format', function() {
              td.verify(_exec('render', page, { filename, format: 'png' }));
            });
          });

          context('and not passed format in its options obj', function() {
            beforeEach(function() {
              page.render(filename, { foo: 'png' });
            });

            it('sets `options.format`', function() {
              let expectedOptions = {
                filename,
                foo: 'png',
                format: 'pdf'
              };

              td.verify(_exec('render', page, expectedOptions));
            });
          });
        });

        context('for which the extension cannot be discerned', function() {
          let filename = 'doggie';

          beforeEach(function() {
            page.render(filename, { foo: 'png' });
          });

          it('does not try to set `options.format`', function() {
            td.verify(_exec('render', page, { filename, foo: 'png' }));
          });
        });
      });

      context('when passed an options obj as the first argument', function() {
        context('with a filename with a discernible extension', function() {
          let filename = 'doggie.png';

          context('and without a format', function() {
            beforeEach(function() {
              page.render({ filename });
            });

            it('sets options.format', function() {
              td.verify(_exec('render', page, { filename, format: 'png' }));
            });
          });
        });
      });

      context('when proxied command succeeds', function() {
        let expectedResponse = 'success';
        let response;

        beforeEach(async function() {
          td.when(_exec(), { ignoreExtraArgs: true })
            .thenReturn(expectedResponse);

          response = await page.render();
        });

        it('returns the proxied result', function() {
          expect(response).to.equal(expectedResponse);
        });
      });

      context('when proxied command fails', function() {
        let error = new Error();

        beforeEach(function() {
          td.when(_exec(), { ignoreExtraArgs: true })
            .thenThrow(error);
        });

        testAsyncFunctionThrows(error, () => page.render());
      });
    });
  });

  describe('#destroy', function() {
    // todo
  });
});
