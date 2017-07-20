---
layout: page
title: "render-vendor"
---

render-vendor helps you manage long-lived, highly-performant, parallel HTML => PDF rendering queues in Node.js apps.

**Some benefits:**

- Can achieve < 30ms render speeds—10-100x faster than most typical solutions, e.g. [`html-pdf`](https://www.npmjs.com/package/html-pdf), [`wkhtmltopdf`](https://wkhtmltopdf.org);
- Exposes an asynchronous API to Renderer procs, so your main app can observe rendering state without blocking;
- Modular architecture makes it easy to swap internal components, e.g. Headless Chrome vs. PhantomJS; and
- Integrates easily into modern JS build pipelines, so you can use your preferred SPA or templating engine.

**Architecturally**, render-vendor aims to shield your app logic from:

- A long-lived headless browser, which "displays"...
- An HTML + CSS + JS single-page application, which subscribes to...
- A websocket server, which will emit relevant data for the rendered page.


#### render-vendor vs. ember-render-vendor

This site documents the core render-vendor lib, as well as the companion ember-render-vendor lib. Curious which is for you?

- If you are building an Ember.js + Electron app, and would like to render PDFs from `.hbs` templates, [ember-render-vendor]({{site.baseurl}}/pages/render-vendor-js) has you covered;
- Else [render-vendor.js]({{site.baseurl}}/pages/render-vendor-js) documents the core API, though you may want to start with the [Quickstart]({{site.baseurl}}/pages/quickstart).

#### Credits
render-vendor is maintained by [Isle of Code](https://isleofcode.com) in Toronto. Initial release was sponsored by [Common Sort](https://commonsort.com).

If you would like to contribute to the project and / or sponsor further development, please do reach out to talk about:

- Adding bindings for other languages, e.g. Ruby, Go;
- Integrating with other build pipelines or SPA frameworks, e.g. Webpack, React;
- Deploying to different environments, e.g. web server, embedded device; or
- Really anything else, just giving you ideas here :)
