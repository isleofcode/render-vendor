---
layout: page
title: render-vendor
---

#### render-vendor is the fastest way to render HTML documents to PDFs
_(or PNGs, JPEGs, BMPs...)_

The [Renderer](/pages/renderer) loads HTML templates into [Pages](/pages/page), which are later rendered into the
desired format. With render-vendor, you can:

- Generate PDFs in 10s of milliseconds (10-100x faster than several popular solutions);
- Handle jobs asynchronously;
- Swap internal components, e.g. Headless Chrome vs. PhantomJS; and
- Integrate easily into modern JS build pipelines (e.g. React, Glimmer, Vue). For Ember + Electron projects, consider using [ember-render-vendor](https://github.com/isleofcode/ember-render-vendor)


#### Quickstart
##### Installation:

Install via [yarn](https://yarnpkg.com) or [npm](http://npmjs.org/):

```bash
yarn add render-vendor
npm install render-vendor
```

[**👶 New to Node.js?:** See more](#new-to-node)

##### Usage:

Open the Node.js REPL (i.e. type `node` in your working directory from above),
then run the following:

```javascript
const { Renderer } = require('render-vendor');

Renderer.load('https://isleofcode.com').then((page) => {
  return page.render('./out.pdf');
}).catch((err) => {
  console.error(err);
}).then(() => {
  Renderer.destroy();
}).then(() => {
  process.exit();
});
```

The process should exit automatically, and your directory should have a shiny
new `out.pdf`!

**⚠ BE CAREFUL: the default Renderer boots a parallel PhantomJS
process. It is not bound to your REPL / application's lifecycle. Make sure to
`destroy()` any Renderers you create.**

#### ember-render-vendor

Are you building an Ember.js + Electron app? Check out [ember-render-vendor](https://github.com/isleofcode/ember-render-vendor),
a companion lib that: uses the Broccoli build pipeline to:

- Synchronizes data between your main application and rendered Page objects; and
- Uses the Broccoli build pipeline to make writing parallel renderers as simple as writing components.

#### Credits
render-vendor is maintained by [Isle of Code](https://isleofcode.com) in Toronto.
Initial release was sponsored by [Common Sort](https://commonsort.com).

Thanks also to @marcbachmann & contributors to [`node-html-pdf`](https://github.com/marcbachmann/node-html-pdf), from which the
PhantomRender's internal `render()` implementation was lovingly aped.

<a name='new-to-node'>
##### 👶 New to Node.js:

Assuming you've [installed Node.js](https://nodejs.org/en/download/), try the following:

- `cd` into a working directory (or `mkdir` a new one);
- Run `npm init` and follow the prompts to create your first `package.json`; then
- Run the `npm install` command above: `npm install render-vendor`.
