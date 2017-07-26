---
layout: page
title: "Page"
---

Pages are objects presented by a Renderer, which may freeze and output their
presented state at any time + with a variety of formats.

The data presented on a Page may change over time; you `render()` output to
capture it in a moment of time, in a format of your choosing.

#### Constructor:

**⚠ BE CAREFUL: Most users should not be constructing Page instances directly.
Please use the mechanisms provided by a Renderer you've created, i.e. the
`renderer.load(...)` & `renderer.refresh()` functions.**

Pages are constructed with an attrs object, which must include the following
keys:

| Key | Type | Description |
| `id` | String| Unique id with which to identify the Page in its renderer. |
| `renderer` | Renderer | Renderer instance that manages the Page. |

Any additional keys passed to the constructor will be persisted on the object.

#### Attributes:

| Key | (get|set) | Type | Description |
| `isLoading` | (get|set) | Boolean | `true` when loading. Setting this value will automatically set `isLoaded` to false. |
| `isLoaded` | (get|set) | Boolean | `true` when loaded. Setting this value will automatically set `isLoading` to false. |
| `isDestroying` | (get|set) | Boolean | `true` when destroying. Setting this value will automatically set `isLoading` + `isLoaded` to false. |
| `isDestroyed` | (get|set) | Boolean | `true` when destroyed. Setting this value will automatically set `isLoading` + `isLoaded` + `isDestroying` to false. |
| `renderer` | (get) | Renderer | Renderer instance that manages the Page. |

#### Methods:

All methods tagged as `async` return Promises. "Return value" indicates what a
successful promise will resolve with, either via `await` or `.then(...)`.

| Function signature | Return value | Description |
| `async load(id, options = {})` | Page | Proxies directly to renderer's `loadPage` implementation; will reset `isLoading` if the renderer throws. |
| `async render(filename, options = {})` | * | Parses provided arguments and proxies to renderer's `renderPage` implementation. If `filename` is omitted, `options` will be parsed from the first argument passed. If `filename` or `options.filename` exist, and `options.format` is blank or invalid (not a string), this function will try to parse the desired format from the filename. |
| `async destroy()` | - | Proxies directly to renderer's `unloadPage` implementation; will reset `isDestroying` if the renderer throws. |

#### Static Methods:

The Page object has a single static method:

| Function signature | Return value | Description |
| `static async all({ renderer })` | [Page] | Proxies to `this.renderer.ping()`, and constructs new Page instances referenced by the `ids` key in the returned object. |
