# Render Vendor

**Long-lived Phantom.js Renderer processes in a lib.**

Render Vendor vends renderers. Here are some cases you want a vended renderer:

- Traditional Phantom.js renders are too slow to run;
- You plan on re-rendering several variants of a given template; or
- You would like to communicate with a renderer over HTTP.

Render Vendor Renderers are JS objects that wrap an HTTP interface to a running
Phantom.js instance. Doing so lets us maintain control over a long-lived proc
w/o having to automate the page's actions (i.e. in case external procs should
trigger a render action).

## Installation

Install via [npm](http://npmjs.org/):

```
$ npm install render-vendor --save
```

## Usage
```javascript
import fs from 'fs';
import RenderVendor from 'render-vendor';

const { Renderer } = RenderVendor;

console.log(RenderVendor.renderers().length);
// 0

RenderVendor.create(rendererOptions)
  .render(renderOptions)
  .then((tmpPath) => {
    let buffer = fs.readFileSync(tmpPath);

    fs.unlink(tmpPath);
    return buffer;
  });
  .catch((err) => {
    console.error(err);
  });

console.log(RenderVendor.renderers().length);
// 1

new Renderer({});
// error: missing port

let renderer = new Renderer({ port: 8181 });
console.log(RenderVendor.renderers().length);
// 1

RenderVendor.shutdown();
console.log(RenderVendor.renderers().length);
// 0

renderer.shutdown();
```

## API
### RenderVendor
| Key               | Returns    | Notes                                                   |
|-------------------|------------|---------------------------------------------------------|
| create()          | Renderer   | Accepts RendererOptions                                 |
| destroy(renderer) | -          | Rms Renderer from `renderers()` & shuts it down cleanly |
| renderers()       | [Renderer] | Returns all vended renderers                            |
| shutdown()        | -          | Iterates over `renderers()`, calling `destroy` on each  |

### Renderer
| Key              | Returns  | Notes                                                |
|------------------|--------- |------------------------------------------------------|
| `new Renderer()` | Renderer | Accepts RendererOptions                              |
| port             | Number   | Port on which its Phantom.js webserver is running    |
| render()         | Promise  | Render page; accepts RenderOptions                   |
| shutdown()       | -        | Shuts down renderer cleanly to prevent process leaks |

### RendererOptions
| Key            | Type           | Required | Default  | Notes                                          |
|----------------|----------------|----------|----------|------------------------------------------------|
| phantomOptions | PhantomOptions | N        | -        |                                                |
| port           | String         | Y\*      | 8180(+n) | Port on which to run the Phantom.js webserver  |
| url            | String         | N\*\*    | -        | URL to load in the Phantom.js page             |
| html           | String         | N        | -        | Content to set in the Phantom.js page          |
| dpi            | Number         | N        | -        | Configure rendered dpi, for non-px size values |
| zoomFactor     | Number         | N        | 1        | Scales images when not rendering PDFs          |
| viewportSize   | Object         | N        | -        | Pass in { width, height } to size viewport     |

\* Port is a required argument for Renderer constructors, but is automatically
set by `RenderVendor.create` if not passed.

\*\* _Either_ `url` or `html` values must be passed. If both are passed, `html`
takes precedence.

### RenderOptions
| Key          | Type         | Required | Default | Notes                                                     |
|--------------|--------------|----------|---------|-----------------------------------------------------------|
| type         | String       | N        | 'pdf'   | Output file type; `[pdf|png|jpeg|bmp|ppm|gif]`            |
| quality      | Number       | N        | 75      | Quality with which to render output (for PNG + JPEG types)|
| paperOptions | PaperOptions | N        | -       | Phantom.js options to set paper (i.e. printable) params   |

### PhantomOptions
| Key  | Type   | Required | Default                              | Notes                                                |
|------|--------|----------|--------------------------------------|------------------------------------------------------|
| args | Array  | N        | []                                   | Command-line args passed when booting Phantom.js bin |
| bin  | String | N        | `require('phantomjs-prebuilt').path` | Path to Phantom.js bin                               |

### PaperOptions
Based on Phantom.js'
[PaperSize](http://phantomjs.org/api/webpage/property/paper-size.html) options.

| Key         | Type           | Required | Default | Notes                                                              |
|-------------|----------------|----------|---------|--------------------------------------------------------------------|
| height      | String         | Y\*      | -       | e.g. `10.5in`                                                      |
| width       | String         | Y\*      | -       | e.g. `8in`                                                         |
| format      | String         | Y\*      | -       | `[A3|A4|A5|Legal|Letter|Tabloid]`                                  |
| orientation | String         | Y\*      | -       | `[portrait|landscape]`                                             |
| margin      | String|Object  | N        | 0       | e.g. `0.5in`, `{ top: 0, bottom: 0, left: '1.5in', right: '2in' }` |
| header      | SectionOptions | N        | -       |                                                                    |
| footer      | SectionOptions | N        | -       |                                                                    |

\* _Either_ `(height + width)` or `(format + orientation)` are required. If
all are present, `(height + width)` are used.

### SectionOptions
| Key      | Type          | Required | Default | Notes                                                                    |
|----------|---------------|----------|---------|--------------------------------------------------------------------------|
| height   | String        | N        | -       | e.g. `45mm`                                                              |
| contents | String|Object | Y        | -       | e.g. `<div>foo</div>` or Object reading keys `[first|last|default|0-9*]` |


Allowed units in all cases are mm, cm, in, & px.

#### Headers & Footers
RenderVendor uses the same header & footer handling as `html-pdf`. You can set
it in your config object, or it can be read from the HTML source.

To override default headers or footers on a specific page, you must create
elements in your HTML with ids conforming to the following syntax:

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

The Renderer will substitute `$page` & `$numPages` text in headers / footers
with the corresponding value.

## Todos
- Test suite
- Might be useful to repurpose Renderers after spawning, e.g. via `load` API
- Re-add support for HTTP headers?

## Credits
This project began as a fork of
[node-html-pdf](https://github.com/marcbachmann/node-html-pdf), but quickly
became a substantive rewrite due to perf issues. It still retains much wisdom
from its predecessor, esp re: the rendering pipeline (e.g. header + footer
management). Thanks @marcbachmann & crew!
