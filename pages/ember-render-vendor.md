---
layout: page
title: "ember-render-vendor"
---

[`ember-render-vendor`](https://www.npmjs.com/package/ember-render-vendor) provides Ember.js + Electron apps with a tidy + performant interface to `render-vendor.js`.

`render-vendor.js` vends performant, long-lived renderer processes tuned for repetitive, high-throughput HTML => PDF rendering jobs.
For more, [see the docs]({{site.baseurl}}/pages/render-vendor-js).

This lib generates HTML + CSS + JS single-page applications for declared renderers using the Glimmer framework.
It also exposes a `Renderer` interface to your Ember app that degrades gracefully when not available (e.g. in the browser).

When an Ember UI is loaded into an Electron `BrowserWindow`, it receives access to a globally-available `render-vendor` interface.
This global interface observes and emits data it is provided to the generated Glimmer apps.
The global r-v interface also proxies `render()` commands to the named renderer.


## Installation

Install via [ember-cli](https://ember-cli.com/):

```bash
$ ember install ember-render-vendor --save

# if blueprint did not run automatically
$ ember g ember-render-vendor
```

*n.b. we use --save to install e-r-v as a dep, so it will be packaged with your [e-electron](https://github.com/felixrieseberg/ember-electron) builds.*


## Usage

This addon's default blueprint should generate a `renderers` dir at the root of your app, with one subdir (`-public`).

Any files added to `-public` will be available for use in all renderer templates.

Valid `renderers` subdirs do not start with a `-`, and contain two files:

- `template.hbs`, a handlebars file that defines your renderer's template (w/ dynamic data provided by `data`); and
- `renderer.js`, which is loaded into your Ember app and may be accessed with the `rendererFor` helper (use it like service injection)


#### Example
```handlebars
{!-- renderers/invoice/template.hbs --}

<div id="container">
  <img id="logo" src="{{data.logoUrl}}"/>

  <h1>hello {{data.customerName}}</h1>
  <h4>you owe {{data.total}}</h4>
</div>

<style>
  #logo {
    padding: 10px;
  }

  h1 {
    font-weight: bold;
  }
</style>
```

```javascript
// renderers/invoice/renderer.js

import Renderer from 'ember-render-vendor';

export default Renderer.extend({
  attrs: [
    'logoUrl',
    { 'customer.name': 'customerName' },
    { 'total': 'total', transform(amount) {
      return (Math.round(Number(amount) * 100) / 100).toFixed(2);
    } }
  ],

  render() {
    return this._super({
      paperOptions: {
        width: '2.25in',
        height: '1.25in'
      }
    });
  }
});
```

```javascript
// app/routes/invoice.js

import { rendererFor } from 'ember-render-vendor';

export Ember.Route.extend({
  invoiceRenderer: rendererFor('invoice'),
  nametagRenderer: rendererFor('nametag'),

  afterModel(model) {
    this.set('invoiceRenderer.data', model);
  },

  actions: {
    renderPdf() {
      this.get('invoiceRenderer').render()
        .then((filepath) => console.log(`path to pdf: ${filepath}`));
    },

    renderNametag(person) {
      this.set('nametagRenderer.data', person);
      Ember.run.next(this.get('nametagRenderer'), 'render');
    }
  }
});
```

```javascript
// ember-electron/main.js
// n.b. ideally this will move to an addon-friendly initializer + cleanup story upstream

// ...

let initializersDir = join(process.cwd(), 'ember-electron', 'initializers');
readdirSync(initializersDir)
  .map((name) => require(join(initializersDir, name)))
  .forEach((initializer) => initializer(app));

// ...
```

#### Broccoli

e-r-v uses e-cli's Broccoli build pipeline to generate output & funnel it to the desired node in your built tree.

For example, if your working directory looks like:

```
- my-ember-app
|-- app
|   |-- ...
|-- config
|-- ember-electron
|   |-- main.js
|-- renderers
    |-- -public
    |   |-- imgs
    |       |-- logo.png
    |-- foo
    |   |-- renderer.js
    |   |-- template.hbs
    |-- bar
        |-- renderer.js
        |-- template.hbs
```

Your built output will look like:

```
- built
|-- ember
|   |-- <built ember app> // n.b ember app can now `lookup(renderers:foo|renderers:bar)`
|-- ember-electron
|   |-- main.js
|   |-- initializers
|       |-- ember-render-vendor.js
|-- renderers
|   |-- foo
|   |   |-- <built glimmer app> // n.b. uses foo/template.hbs
|   |   |-- imgs
|   |       |-- logo.png
|   |-- bar
|       |-- <built glimmer app> // n.b. uses bar/template.hbs
|       |-- imgs
|           |-- logo.png
|-- package.json
```


## Architecture

`ember-render-vendor` automatically injects an **`ember-electron` initializer** which, when called (see sample files below), will:

- `require('render-vendor')` and assign it to the `global` object; and
- Create a websocket server in the main proc.

**`/renderers`** is where you declare your renderer interfaces.
Each subdir that does not start with `-` (e.g. `-foo`) MUST contain:

- `renderer.js`, which provides an `attrs` interface used to whitelist & optionally transform data before emitting it to the renderer; and
- `template.hbs`, a handlebars template to be compiled into the resulting single-page application.

`ember-render-vendor` uses `e-cli` hooks and `Broccoli` to compile a unique **`Glimmer`** app for each `/renderers` subdir.
All apps inherit from a minimalist base app, which subscribes to a websocket and filters for relevant updates.

When a consumer uses the **`rendererFor`** util to lookup a renderer in the main Ember app and set its model, this model is immediately emitted to the relevant Glimmer app.
The Glimmer app will automatically update the DOM to render the freshest data, so all calls to `renderer.render()` have little to wait on.

## API
### rendererFor
TODO doc

### Renderer
TODO doc

## ToDos

* write test suite
* chat with Fastboot team about server integration
* consider implementing e-electron build tooling upstream
