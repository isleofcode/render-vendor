---
layout: page
title: "Quickstart"
---

## 1. Setup

In your terminal, `cd` into a node-enabled directory*, then install render-vendor:

```
npm install render-vendor
```

Then open [the node REPL](https://docs.nodejitsu.com/articles/REPL/how-to-use-nodejs-repl/):

```
node
```

_*i.e. run the above commands from a directory with a valid package.json.
If you're not sure what this means, first [install Node.js](https://nodejs.org/en/download/),
then run `npm init` and follow the prompts._


## 2. Render!
#### Inline HTML

RenderVendor can consume raw HTML. Try running this in your REPL:

```
const RenderVendor = require('render-vendor').default;

let renderer = RenderVendor.create({ html: '<html><body><h1>hello</h1></body></html>' });
let renderJob = renderer.render({ filename: './out-inline.pdf', type: 'pdf' });

renderJob = renderJob.then(() => RenderVendor.shutdown());
renderJob.finally(() => process.exit());
```


#### HTML documents

RenderVendor can also consume HTML from any URL. Try running this in your REPL:

```
const RenderVendor = require('render-vendor').default;

let renderer = RenderVendor.create({ url: 'https://google.com' });
let renderJob = renderer.render({ filename: './out-url.pdf', type: 'pdf' });

renderJob = renderJob.then(() => RenderVendor.shutdown());
renderJob.finally(() => process.exit());
```

This method will also work with file URLs.
