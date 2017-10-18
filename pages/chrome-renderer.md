---
layout: page
title: ChromeRenderer
---

render-vendor ships with ChromeRenderer, a default Renderer implementation that
uses Google's [puppeteer](https://try-puppeteer.appspot.com/) project to manage a long-lived, parallel renderer
process to load, manage, and render Pages.

ChromeRenderers are particularly well-suited to applications looking to render
static output from dynamic templates (e.g. invoicing or ticketing software, POS
terminals piping data to networked printers...). Render jobs benchmark in 10s of
ms once booted, vs. ranges of 100s of ms to several seconds for other popular
approaches, making ChromeRenderers ideal for high-throughput environments.

ChromeRenderers extend the base [Renderer](/pages/renderer) class to support the following options:

#### `Renderer#load(id, options)` ([source](/pages/renderer#api-load)):

ChromeRenderers may load HTML documents, either from raw HTML data passed in
the load request, or fetched from a provided URL.

Any option key/value pairs not documented below are passed directly to
Puppeteer's `Page#goto` function. See [puppeteer docs](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options) for more info.

| **Key** | **Type** | **Default value** | **Description** |
| `url`\* | String | - | URL to load in the PhantomJS page. |
| `html`\* | String | - |8180 | HTML source to set on the PhantomJS page. |

\*At least one of `html` or `url` is required, if `id` is not itself a URL.
`html` will take priority over `url`.

#### `Page#render([filepath,] options)` ([source](/pages/page#render)):

When rendering a Page, ChromeRenderers will proxy passed options to Puppeteer's
[`Page#content()`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagecontent), [`Page#pdf`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions), or [`Page#screenshot`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagescreenshotoptions) functions, depending on
the type selected.

As with `Renderer#load`, any option key/value pairs not documented below are
passed directly to the relevant Puppeteer function, documented + linked above.

| **Key** | **Type** | **Default value** | **Description** |
| `type` | String | html | Inherited from `Page#render`. When `html`, calls to `render()` will return the rendered HTML source; otherwise, the ChromeRenderer will try to render a file in the given format. |
| `path` | String | undefined | Inherited from `Page#render`. When not provided, calls to `render()` will resolve with the rendered object as a raw `Buffer`. When provided, the promise will resolve with the path to the rendered file. |

<a name='valid-formats'></a>
`format` may be any of the following values:

- html;
- pdf;
- png; or
- jpeg.

#### `Renderer.constructor(attrs = {})` ([source](/pages/renderer#api-constructor)):

ChromeRenderer instances' boot method makes use of several options that may be
provided as attributes to the constructor using the key `bootOptions`.

By default, ChromeRenderer uses [`puppeteer.launch`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions), with its default params. If
`browserWSEndpoint` is passed, e.g. as `{ bootOptions: { browserWSEndpoint: '...' } }`,
`Renderer#boot` will use [`puppeteer.connect`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions) instead.

| **Key** | **Type** | **Default value** | **Description** |
| `bootOptions` | Object | undefined | Options to proxy to the puppeteer boot function |
