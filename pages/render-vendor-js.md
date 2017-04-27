---
layout: page
title: "render-vendor.js"
---

`render-vendor.js` vends performant, long-lived renderer processes tuned for repetitive, high-throughput HTML => PDF rendering jobs.

Here are some cases you want a vended renderer:

- Your current `wkhtmltopdf`-, `Phantom.js`-, or `Electron`-based rendering stack is too slow for your needs;
- You need to re-render one or more templates with data provided by another long-lived app / process; or
- You want to focus on writing your app vs. boilerplate rendering code, but require an expressive API + lots of customizability.

#### Architecture

**RenderVendor** is your primary interface to the lib.
It wraps initialization & cleanup behaviour, e.g. so you can tidy up with `RenderVendor.shutdown()` at the end of your app's run.

**Renderers** are JS objects that wrap a renderer process (e.g. a headless browser).
These provide a standard interface to `render()` what the headless browser sees.

Currently, Phantom.js is the only `Renderer` "substrate" shipped with the lib.
This is because, at time of writing, Headless Chrome cannot render PDFs,
  and Electron `BrowserWindow`s have fewer available options for managing pagination, headers, footers...

*PRs enabling other substrates are very much welcome!*

The Phantom.js substrate is a long-lived proc with an embedded web server.
After much research, this seemed the best option for a non-blocking, persistent, scriptable interface to a Phantom.js instance
(in their defence, secure I/O is hard!).

In summary: `RenderVendor` consumers
will create `Renderers`,
which will load arbitrary HTML / a URL on init
& may be `render()`ed from at any time.

## Installation

Install via [yarn](https://yarnpkg.com) or [npm](http://npmjs.org/):

```
$ yarn add render-vendor --save
$ npm install render-vendor --save
```

## Usage
```javascript
const childProcess = require('child_process');
const fs = require('fs');

const RenderVendor = require('render-vendor').default;
const { Renderer } = RenderVendor;

console.log(RenderVendor.renderers().length);
// => 0

RenderVendor.create({ html: '<html><body><h1>hello</h1></body></html>' }) // see Renderer.constructor
  .render({ filename: '/tmp/render-vendor/out.pdf', type: 'pdf' }) // see Renderer#render
  .then((outFile) => {
    childProcess.exec(`open ${outFile}`);
    fs.unlink(tmpPath);
  });
  .catch((err) => {
    console.error(err);
  });

// pdf file should have opened

console.log(RenderVendor.renderers().length);
// => 1

new Renderer({});
// error: missing port

let renderer = new Renderer({ port: 8181 });
// notice how we're not using `RenderVendor`. how many renderers does it know of?

console.log(RenderVendor.renderers().length);
// => 1

RenderVendor.shutdown();
// this will not have shutdown the successful `new Renderer` instance, even though...

console.log(RenderVendor.renderers().length);
// => 0

renderer.shutdown();
// only you can prevent memory leaks
```

## Benchmarks

render-vendor started from an experiment to use `html-pdf` in a project.
While the API was friendly, each render job took 2-3s to complete.

On inspection, it seemed most of the penalty came from booting the Phantom process & loading the web assets.
Simple payloads like the one used above took almost as much time to render as relatively more complete web pages.

Using the following instrumentation script, we have observed render-vendor performance surpass 100x the `html-pdf` method.
**Namely: several test runs of 100 PDFs rendered resulted in times between 1.5 & 2s, vs. `html-pdf`'s 1 per 2s.**

```javascript
const RenderVendor = require('render-vendor').default;
let renderer = RenderVendor.create({ html: '<html><body><h1>hello</h1></body></html>' });

function instrument(n) {
  let q = require('rsvp').resolve();
  let a = process.hrtime();

  for (n; n > 0; n--) {
    let i = n;
    q = q.then(() => renderer.render({ filename: `/tmp/render-instr/${i}.pdf` }));
  }

  return q.then(() => {
    let b = process.hrtime();

    console.log([b[0] - a[0], b[1] - a[1]]);
  });
}
```

## API
### RenderVendor

| Key                            | Returns      | Notes                                                     |
|----
| `create(RendererOptions = {})` | `Renderer`   | Constructs `Renderer` and adds it to `renderers()`        |
| `destroy(renderer)`            | -            | Rms `Renderer` from `renderers()` & shuts it down cleanly |
| `renderers()`                  | `[Renderer]` | Returns all vended renderers                              |
| `shutdown()`                   | -            | Iterates over `renderers()`, calling `destroy` on each    |

### Renderer

| Key                                  | Returns    | Notes                                                       |
|----
| `new Renderer(RendererOptions = {})` | `Renderer` | Constructs `Renderer`, but does not add it to `renderers()` |
| `port`                               | `Number`   | Port on which its Phantom.js webserver is listening         |
| `render(RenderOptions = {})`         | `Promise`  | Render page                                                 |
| `shutdown()`                         | -          | Shuts down renderer cleanly to prevent process leaks        |

#### RendererOptions

| Key            | Type             | Required | Default  | Notes                                          |
|----
| phantomOptions | `PhantomOptions` | N        | -        |                                                |
| port           | `String`         | Y\*      | 8180(+n) | Port on which to run the Phantom.js webserver  |
| url            | `String`         | N\*\*    | -        | URL to load in the Phantom.js page             |
| html           | `String`         | N        | -        | Content to set in the Phantom.js page          |
| dpi            | `Number`         | N        | -        | Configure rendered dpi, for non-px size values |
| zoomFactor     | `Number`         | N        | 1        | Scales images when not rendering PDFs          |
| viewportSize   | `Object`         | N        | -        | Pass in { width, height } to size viewport     |

\* Port is a required argument for Renderer constructors, but is automatically
set by `RenderVendor.create` if not passed.

\*\* _Either_ `url` or `html` values must be passed. If both are passed, `html`
takes precedence.

#### RenderOptions

| Key          | Type           | Required | Default | Notes                                                      |
|----
| type         | `String`       | N        | 'pdf'   | Output file type; `[pdf|png|jpeg|bmp|ppm|gif]`             |
| quality      | `Number`       | N        | 75      | Quality with which to render output (for PNG + JPEG types) |
| paperOptions | `PaperOptions` | N        | -       | Phantom.js options to set paper (i.e. printable) params    |

#### PhantomOptions

| Key  | Type     | Required | Default                              | Notes                                                |
|----
| args | `Array`  | N        | []                                   | Command-line args passed when booting Phantom.js bin |
| bin  | `String` | N        | `require('phantomjs-prebuilt').path` | Path to Phantom.js bin                               |

#### PaperOptions
Based on Phantom.js' [PaperSize](http://phantomjs.org/api/webpage/property/paper-size.html) options.

| Key                        | Type               | Required | Default | Notes                                                              |
|----
| height                     | `String`           | Y\*      | -       | e.g. `10.5in`                                                      |
| width                      | `String`           | Y\*      | -       | e.g. `8in`                                                         |
| isSinglePage               | `Boolean`          | N        | -       | Set to true if you'd like to render to a single page               |
| singlePageHeightMultiplier | `Number`           | N        | 1.31    | Configure this if the computed single-page height needs massaging  |
| format                     | `String`           | Y\*      | -       | `[A3|A4|A5|Legal|Letter|Tabloid]`                                  |
| orientation                | `String`           | Y\*      | -       | `[portrait|landscape]`                                             |
| margin                     | `String`\\|`Object` | N        | 0       | e.g. `0.5in`, `{ top: 0, bottom: 0, left: '1.5in', right: '2in' }` |
| header                     | `SectionOptions`   | N        | -       |                                                                    |
| footer                     | `SectionOptions`   | N        | -       |                                                                    |

\* _Either_ `(height + width)` or `(format + orientation)` are required. If
all are present, `(height + width)` are used.

#### SectionOptions
| Key      | Type          | Required | Default | Notes                                                                    |
|----
| height   | String        | N        | -       | e.g. `45mm`                                                              |
| contents | String|Object | Y        | -       | e.g. `<div>foo</div>` or Object reading keys `[first|last|default|0-9*]` |


Allowed units in all cases are mm, cm, in, & px.

#### Headers & Footers
RenderVendor uses the same header & footer handling as `html-pdf`.
You can set it in your config object, or it can be read from the HTML source.

To override default headers or footers on a specific page, you must create elements in your HTML with ids conforming to the following syntax:

```html
<div id="pageHeader">Default header</div>
<div id="pageHeader-first">Header on first page</div>
<div id="pageHeader-2">Header on second page</div>
<div id="pageHeader-3">Header on third page</div>
<div id="pageHeader-last">Header on last page</div>
...
<div id="pageFooter">Default footer</div>
<div id="pageFooter-first">Footer on first page</div>
<div id="pageFooter-2">Footer on second page</div>
<div id="pageFooter-last">Footer on last page</div>
```

The `Renderer` will substitute `$page` & `$numPages` text in headers / footers with the corresponding value.

## Todos
- Test suite
- Might be useful to repurpose Renderers after spawning, e.g. via `load` API
- Re-add support for HTTP headers?

## Credits
This project began as a fork of [`node-html-pdf`](https://github.com/marcbachmann/node-html-pdf), but quickly became a substantive rewrite due to perf issues.

It still retains much wisdom from its predecessor, esp re: the rendering pipeline (e.g. header + footer management). Thanks @marcbachmann & crew!
