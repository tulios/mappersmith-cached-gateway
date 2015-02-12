[![npm version](https://badge.fury.io/js/mappersmith-cached-gateway.svg)](http://badge.fury.io/js/mappersmith-cached-gateway)
# Mappersmith CachedGateway

**CachedGateway** is a gateway for [Mappersmith](https://github.com/tulios/mappersmith) that wraps a transport gateway with a cache store to achieve transparent cache functionalities. It provides cache stores for browser and server.

## Install

#### NPM

```sh
npm install mappersmith-cached-gateway
```

#### Browser

Download the tag/latest version from the build folder.

#### Build from the source

Install the dependencies

```sh
npm install
```

Build

```sh
npm run build
```

## Requiring in Node.js

For use in the server side.

```javascript
var MappersmithCachedGateway = require('mappersmith-cached-gateway/node');
```

If you don't need any server features (like redis cache store) just require the module:

```javascript
var MappersmithCachedGateway = require('mappersmith-cached-gateway');
```

## Usage

Create and configure a CachedGateway is as simple as:

```javascript
var manifest = {} // imagine that we have a manifest for Mappersmith
var MyCachedGateway = MappersmithCachedGateway.createCachedGateway()
var Client = new Mappersmith.forge(manifest, MyCachedGateway)
```

Without parameters `MyCachedGateway` will be created with `Mappersmith.VanillaGateway` and `LocalStorageCacheStore`.

### With a different Gateway

Use the first parameter of `createCachedGateway` to configure your
transport gateway, for example, if we want to use `Mappersmith.JQueryGateway`.

```javascript
var manifest = {}
var JQueryGateway = Mappersmith.JQueryGateway;
var CGateway = MappersmithCachedGateway;

var MyCachedGateway =  CGateway.createCachedGateway(JQueryGateway)
var Client = new Mappersmith.forge(manifest, MyCachedGateway)
```

### With a different CacheStore

Use the second parameter to configure your cache store. Check the list of [available cache stores](#bundled-implementations) at the bottom of the readme.

```javascript
var manifest = {}
var JQueryGateway = Mappersmith.JQueryGateway;
var CGateway = MappersmithCachedGateway;

var SSCacheStore = CGateway.SessionStorageCacheStore;
var MyCachedGateway = CGateway.createCachedGateway(JQueryGateway, SSCacheStore)
var Client = Mappersmith.forge(manifest, MyCachedGateway)
```

### Options for CacheStore

There are two options which can be configured for a cache store: **namespace** and **ttl** (Some cache stores may have specific options, check the list of [available cache stores](#bundled-implementations) for a comprehensive list of options). The time to live (ttl) value can be defined globally and for each request using gateway options. It is possible to change the default ttl (the global value) through `createCachedGateway`, just pass an object with the key **ttl** and the value in seconds.

```javascript
var CGateway = MappersmithCachedGateway;
var JQueryGateway = Mappersmith.JQueryGateway;
var SSCacheStore = CGateway.SessionStorageCacheStore;

// With default transport gateway and cache store
CGateway.createCachedGateway({ttl: 10 * 60})

// With a custom transport gateway but with the default cache store
CGateway.createCachedGateway(JQueryGateway, {ttl: 10 * 60})

// With everything custom
CGateway.createCachedGateway(JQueryGateway, SSCacheStore, {ttl: 10 * 60})
```

The namespace goes to the same object:

```javascript
var CGateway = MappersmithCachedGateway;
CGateway.createCachedGateway({ttl: 10 * 60, namespace: 'cache'})
```

#### How to setup a different TTL for each service

Just use Mappersmith URL matching and include the option **cache** into the gateway option, example:

```javascript
var manifest = {
  host: 'http://my.api.com',
  rules: [
    { // This will only be applied when the URL matches the regexp
      match: /\/v1\/books/,
      values: {gateway: {cache: {ttl: 15 * 60}}}
    },
    {
      match: /\/v1\/photos/,
      values: {gateway: {cache: {ttl: 2 * 60}}}
    }
  ],
  resources: {
    Book: {
      all:  {path: '/v1/books.json'},
      byId: {path: '/v1/books/{id}.json'}
    },
    Photo: {
      byCategory: {path: '/v1/photos/{category}/all.json'}
    }
  }
}
```

## CacheStore

**CacheStore** allows you to customize the cache layer. You can use the bundled implementations or write your own version.

### Bundled implementations

__LocalStorageCacheStore__

_Browser only_. Require with `MappersmithCachedGateway.LocalStorageCacheStore`.

__SessionStorageCacheStore__

_Browser only_. Require with `MappersmithCachedGateway.SessionStorageCacheStore`.

__NodeRedisCacheStore__

_Server only_. Require with `MappersmithCachedGateway.node.NodeRedisCacheStore`.

Extra options:

* client (e.g: `client: [6379, '127.0.0.1', options]`) - take a look at [redis package](https://www.npmjs.com/package/redis) for a complete list of options
* logger (default: console) - use `logger: false` to disable the logger
* password - it will issue an AUTH command if defined
* onError - callback to handle redis errors, the first argument is the error message

Example:
```javascript
var cacheStore = new NodeRedisCacheStore({
  redis: {
    client: [6379, '127.0.0.1', {max_attempts: 10}],
    password: 'foobar',
    logger: false,
    onError: function(err) {
      console.error(err);
    }
  }
});
```

Take a look at [node-redis-cache-store.js](https://github.com/tulios/mappersmith-cached-gateway/blob/master/src/node-redis-cache-store.js) to further details.

### How to write one?

```javascript
MappersmithCachedGateway.createCacheStore({
  init: function() {
    // constructor, you have:
    //  - this.options
    //  - this.namespace
    //  - this.ttl
  },

  read: function(name, callback) {
  },

  write: function(name, data, opts, doneCallback) {
  },

  delete: function(name, doneCallback) {
  },

  cleanup: function(doneCallback) {
  },

  clear: function(doneCallback) {
  }

})
```

Take a look at [cache-store.js](https://github.com/tulios/mappersmith-cached-gateway/blob/master/src/cache-store.js) to further docs.

## Tests

Client

1. Build the source (`npm run build-test`)
2. Open test.html

Server

1. `npm test`

## Compile and release

* Compile: `npm run build`
* Release (minified version): `npm run release`

## Licence

See [LICENCE](https://github.com/tulios/mappersmith-cached-gateway/blob/master/LICENSE) for more details.
