---
layout: page
title: PhantomRenderer
---

render-vendor ships with PhantomRenderer, a Renderer implementation that uses a
long-lived, parallel renderer process to load, manage, and render Pages.

We recommend using a [ChromeRenderer](/pages/chrome-renderer) whenever possible, as it implements more
modern web standards & APIs, and its architecture is less prone to memory leaks.
However, some use cases may be better suited to Phantom's environment. The
PhantomRenderer can achieve similar rendering speeds as the ChromeRenderer, so
using it should not significantly impact performance.

**⚠ BE CAREFUL: the PhantomRenderer boots a parallel PhantomJS process. It is
not bound to your REPL / application's lifecycle. Make sure to `destroy()` any
PhantomRenderers you create.**

PhantomRenderers extend the base [Renderer](/pages/renderer) class to support the following options:

#### [`Renderer#load(id, options)`](/pages/renderer#api-load):

PhantomRenderers may load HTML documents, either from raw HTML data passed in
the load request, or fetched from a provided URL.

Several additional options will affect the initial paint, so they must be
provided at load time.

| **Key** | **Type** | **Default value** | **Description** |
| `url`\* | String | - | URL to load in the PhantomJS page. |
| `html`\* | String | - |8180 | HTML source to set on the PhantomJS page. |
| `dpi` | Number | - | Configure rendered dpi, for non-px size values. |
| `zoomFactor` | Number | - | Scales images when not rendering PDFs. |
| `viewportSize` | { width, height } | - | Sets viewport size to the provided width + height values. |

\*At least one of `html` or `url` is required. `html` will take priority over
`url`.

#### `[Page#render](/pages/page#render)`:

At render time, PhantomRenderers accept two options, which are used to make any
final adjustments to the presented document's rendered output:

| **Key** | **Type** | **Default value** | **Description** |
| `format` | String | html | Inherited from `Page#render`. When `html`, calls to `render()` will return the rendered HTML source; otherwise, the PhantomRenderer will try to render a file in the given format. |
| `filename` | String | /tmp/${randomString} | Inherited from `Page#render`. When rendering an output file, setting `filename` will direct the rendered output to the specified path; else the file will be rendered to a randomly generated path in the `/tmp` directory. |
| `quality` | Number | 75 | Quality with which to render output (for PNG + JPEG types). |
| `paperSize` | Object | - | PhantomJS primitive to set values like margin, orientation, headers and footers on the page. For more, [see the PhantomJS `paperSize` docs](http://phantomjs.org/api/webpage/property/paper-size.html). |

<a name='valid-formats'></a>
`format` may be any of the following values:

- html;
- pdf;
- png;
- jpeg;
- bmp;
- ppm; or
- gif (depending on what build of Qt used, [see PhantomJS docs](http://phantomjs.org/api/webpage/method/render.html) for more details)

#### Events:

To assist with debugging, PhantomRenderers emit the following events:

| Event signature | Value type | Description |
| `message(message)` | String | The spawned PhantomJS process has written data to stdout. |
| `error(error)` | String | The spawned PhantomJS process has written data to stderr. |

#### [`Renderer.constructor`](/pages/renderer#api-constructor):

PhantomRenderer instances' boot method makes use of several options that may be
provided as attributes to the constructor. All options have reasonable defaults.

| **Key** | **Type** | **Default value** | **Description** |
| `host` | String | `PhantomRenderer.DEFAULT_HOST`\|localhost | Host on which to bind the PhantomJS webserver. |
| `port` | String | `PhantomRenderer.DEFAULT_PORT`\|8180 | Port on which to bind the PhantomJS webserver. |
| `bin` | String | `require('phantomjs-prebuilt').path` | Path to the PhantomJS binary to run. |
| `binArgs` | [String] | [] | Arguments to pass to the command line invocation that spawns the PhantomJS process. |

#### Headers & Footers:

render-vendor uses similar header & footer handling to the popular `html-pdf`.
You can set it via `paperSize` as described [in the PhantomJS docs](http://phantomjs.org/api/webpage/property/paper-size.html),
or they can be read from the HTML source.

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

PhantomRenderer instances will substitute `$page` & `$numPages` text in headers
/ footers with the corresponding value.
