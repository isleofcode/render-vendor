---
layout: page
title: CLI
---

render-vendor ships with a CLI implementation that uses the default
PhantomRenderer to load and render provided URLs in parallel.

### Usage
#### `render-vendor [urls...]`:

Loads provided URLs, renders to PDF, and prints the filepath.
Try `render-vendor https://isleofcode.com`.

The base `render-vendor` command accepts a `-f` flag, which specifies the output
format. Valid formats are specified by the [PhantomRenderer](/pages/phantom-renderer#valid-formats).

#### `render-vendor list`

Lists spawned PhantomRenderer processes. Useful in case something wasn't shut
down properly.

#### `render-vendor kill`

Kills spawned PhantomRenderer processes. Useful in case something wasn't shut
down properly.
