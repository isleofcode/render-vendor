---
layout: page
title: "render-vendor"
---

render-vendor is a suite of JS libs (& broader pattern) that offers performant + expressive HTML => PDF rendering engines.
r-v libs aim to ship with sane defaults and expose their turtles, all the way down.

Developers use render-vendor to compose parallelizable print queues with a templating engine of their choice.
For example, a SaaS invoicing app might use render-vendor to reduce compute resources needed to serve their users' PDF invoices.
In meatspace, a point-of-sale system might render receipts and reports from a template, and pass them to a thermal printer.

**Some benefits:**

- 100x faster than typical solutions, e.g. npm's `html-pdf` (see more in [Benchmarks]({{site.baseurl}}/pages/render-vendor-js#benchmarks));
- Modular API makes it easy to swap tooling w/o ground-up rewrites, e.g. Headless Chrome for PhantomJS; and
- Parallel rendering procs do not block the engine's driver, e.g. an Electron app.

**Architecturally**, render-vendor libs aim to shield your app logic from:

- A long-lived headless browser, which "displays"...
- An HTML + CSS + JS single-page application, which subscribes to...
- A websocket server, which will emit relevant data for the rendered page.

This site aims to document a render-vendor stack via the two published JS libs, `render-vendor` & `ember-render-vendor`.
See the [render-vendor.js]({{site.baseurl}}/pages/render-vendor-js) guide for more details, plus the core API.
If you are building an Ember.js + Electron app and would prefer to just get started, skip to [ember-render-vendor]({{site.baseurl}}/pages/render-vendor-js).

#### Credits
render-vendor is maintained by [Isle of Code](https://isleofcode.com) in Toronto. Initial release was sponsored by [Common Sort](https://commonsort.com).

If you would like to contribute to the project and / or sponsor further development, please do reach out to talk about:

- Adding bindings for other languages, e.g. Ruby, Go;
- Integrating with other build pipelines or SPA frameworks, e.g. Webpack, React;
- Deploying to different environments, e.g. web server, embedded device; or
- Really anything else, just giving you ideas here :)
