---
layout: page
title: "Renderer"
---

Renderers are objects that `load()` input for presentation. The `Renderer` class
defines the core API to Renderer instances. `Renderer` is implemented as an
abstract class, in that it does not prescribe several core mechanisms, e.g. how
to load and present the provided data.

### Public API:

render-vendor ships with a default Renderer. You access it
using the public API, exposed as static properties + functions on the `Renderer`
constructor. The public API is also available on every Renderer instance.

See [ChromeRenderer](/pages/chrome-renderer) & [PhantomRenderer](/pages/phantom-renderer) for documentation about the options accepted by:

- `Renderer.load(id, options)`
- `Page#render(options)`

#### Attributes:

##### `isBooting` (get|set)

_Type: Boolean_

`true` when booting. Setting this value will automatically set `isBooted` to false.

##### `isBooted` (get|set)

_Type: Boolean_

`true` when booted. Setting this value will automatically set `isBooting` to false.

##### `pages` (get)

_Type: \[Page\]_

Array of Page instances loaded by the Renderer instance. Can be `push`ed to + `splice`d from.

#### Functions:

All functions tagged as `async` return Promises. "Return value" indicates what a
successful promise will resolve with, either via `await` or `.then(...)`.

##### `find(id)`

_Returns: `Page|undefined`_

Finds a Page with the given ID in the Renderer's `pages` array

<a name='api-load'>
##### `async load(id, options = {})`

_Returns: `Page`_

Finds or creates a Page with the given ID, then loads it with the passed options. Promise resolves with the Page instance.

##### `async refresh()`

_Returns: -_

Tries to reload Page instances from a previously-booted Renderer. Useful when e.g. recovering access to a parallelized Renderer. Promise resolves with no args, and never rejects.

##### `async destroy()`

_Returns: -_

Iterates over all owned `pages` to destroy each Page instance, then attempts to shutdown the Renderer instance

##### `async \_exec(command, page, ...args)`

_Returns: *_

Ensures the Renderer instance is booted, then calls and proxies the response for the corresping `${command}Page` function. Ideally you will not call to `_exec` directly; it is used primarily to ensure boot state when Page instances proxy commands to their Renderer instance.

#### Events

Renderers extend Node.js' `EventEmitter` class. Renderer implementations may
emit several events, to which can you register callback functions. See
[EventEmitter docs](https://nodejs.org/api/events.html#events_class_eventemitter) for more details.

The [PhantomRenderer emits two events by default](/pages/phantom-renderer#events)

- `message`; and
- `error`

#### Other static attributes

##### `rendererConstructor` (get,set)

_Type: `Constructor|Function|undefined`_

Set this to a constructor or function to override the default Renderer implementation. On init (+ when re-set to `undefined`), this returns `PhantomRenderer`.


##### `renderer` (get|set)

_Type: `Renderer`_

Set this to override the default Renderer used by the proxying getters + methods. On init (+ when re-set to `undefined`), this will construct a new Renderer instance by calling `this.rendererConstructor()`.

<a name='api-constructor'>
#### Constructor:

All calls to `new Renderer()` accept an attrs object, which is then applied to
the returned instance.

**:WARNING: BE CAREFUL: While a basic `Renderer` instance may not be useful, you should trust that any
extensions of the class implement at least the following API:**


For example:

```javascript
let renderer = new Renderer();
let rendererWithFoo = new Renderer({ foo: 'FOO?!?' });

console.log(renderer.foo);
// undefined

console.log(rendererWithFoo.foo);
// FOO?!?
```

#### Private API:

The following functions throw `Renderer.Error.NotImplemented` by default, unless
overridden by an extension (e.g. [PhantomRenderer](/pages/phantom-renderer)). These functions are used to
affect the renderer's state, and are wrapped to provide a predictable API.

##### `async boot()`

_Returns: -_

Instructs the Renderer implementation to boot; should set `isBooted = true` and return once complete.

##### `async shutdown()`

_Returns: -_

Instructs the Renderer implementation to shut down; should set `isBooted = false` and return once complete.

##### `async ping()`

_Returns: Object_

Requests status info from the Renderer implementation. If pages are recoverable, the returned Object should include an array of page IDs keyed like: `{ ids: [...] }`.

##### `async loadPage(page, ...args)`

_Returns: -_

Instructs the Renderer implementation to load the passed Page instance. Implementation should wait until page is loaded before resolving.

##### `async renderPage(page, ...args)`

_Returns: *_

Instructs the Renderer implementation to render the passed Page instance. Implementation should wait until rendered data is generated, and resolve with either the raw data or a URI pointing to it (can depend on the args provided).

##### `async unloadPage(page, ...args)`

_Returns: -_

Instructs the Renderer implementation to unload the passed Page instance. Implementation should wait until page is unloaded before resolving.
