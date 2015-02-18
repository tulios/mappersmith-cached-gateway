!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.MappersmithCachedGateway=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  CacheStore: require('./src/cache-store'),
  LocalStorageCacheStore: require('./src/local-storage-cache-store'),
  SessionStorageCacheStore: require('./src/session-storage-cache-store'),

  /*
   * Creates a new gateway based on the informed transportGateway that will
   * use the informed cacheStore to cache the data.
   *
   * args:
   * @param TransportGateway {Mappersmith.Gateway}.
   *  Default: Mappersmith.VanillaGateway
   * @param CacheStore {MappersmithCachedGateway.CacheStore}.
   *  Default: MappersmithCachedGateway.LocalstorageCacheStore
   *
   * The new gateway will accept the following opts:
   *  cache - an object with the key ttl in seconds
   *  writeCallback - callback to be used as write doneCallback
   */
  createCachedGateway: require('./src/create-cached-gateway'),
  createCacheStore: require('./src/create-cache-store')
}

},{"./src/cache-store":2,"./src/create-cache-store":3,"./src/create-cached-gateway":4,"./src/local-storage-cache-store":5,"./src/session-storage-cache-store":6}],2:[function(require,module,exports){
(function (global){
var Utils = (typeof window !== "undefined" ? window.Mappersmith : typeof global !== "undefined" ? global.Mappersmith : null).Utils;

/*
 * An abstract cache store class. There are multiple cache store
 * implementations, each having its own additional features.
 *
 * @param opts {Object} - accepted keys:
 *  - namespace {String}, default: 'mappersmith_cache'
 *  - ttl {int}, default: 300 (5 minutes)
 */
var CacheStore = function(opts) {
  this.options = Utils.extend({}, opts);
  this.namespace = this.options.namespace || 'mappersmith_cache';
  this.namespaceRegex = new RegExp('^' + this.namespace + ':');
  this.ttl = this.options.ttl || 5 * 60;
}

CacheStore.prototype = {
  /*
   * Generates a key with the configured namespace.
   *
   * @param name {String}
   */
  cacheKey: function(name) {
    return this.isCacheKey(name) ? name : this.namespace + ':' + name;
  },

  isCacheKey: function(name) {
    return this.namespaceRegex.test(name);
  },

  resolveTTL: function(opts) {
    var options = Utils.extend({ttl: this.ttl}, opts);
    var ttl = parseInt(options.ttl, 10);
    if (isNaN(ttl)) ttl = this.ttl;
    return ttl;
  },

  /*
   * Fetches data from the cache, using the given key. If there is data in
   * the cache with the given key, then that data is returned.
   *
   * If there is no such data in the cache (a cache miss), then null will be
   * returned. However, if a block has been passed, that block will be passed
   * the key and executed in the event of a cache miss. The return value of the
   * block will be written to the cache under the given cache key, and that
   * return value will be returned.
   *
   * @param name {String}
   * @param opts {Object} - with:
   *  - request: callback to fetch the data
   *  - gatewayInstance
   *  - writeCallback: callback to be used as write doneCallback
   *  - cacheOpts: options for cache store
   */
  fetch: function(name, opts) {
    var gateway = opts.gatewayInstance;
    var cacheOpts = Utils.extend({}, opts.cacheOpts);

    this.read(name, function(data) {
      if (data === null) {
        var hasProcessor = gateway.processor !== undefined;
        var originalProcessor = gateway.processor || function(data) { return data };

        var wrappedProcessor = function(newData) {
          var args = [name, newData, cacheOpts];
          if (!!opts.writeCallback) args.push(opts.writeCallback);

          this.write.apply(this, args);
          return originalProcessor(newData);

        }.bind(this);

        gateway.processor = wrappedProcessor;
        if (!hasProcessor) gateway.success(gateway.successCallback);
        opts.request();

      } else {
        gateway.successCallback(data);
      }
    }.bind(this));
  },

  /*
   * Fetches data from the cache, using the given key. If there is data in
   * the cache with the given key, then that data is returned. Otherwise,
   * null is returned.
   *
   * @param name {String} - cache key
   * @param callback {Function} - receives data
   */
  read: function(name, callback) {
    throw new Utils.Exception('CacheStore#read not implemented');
  },

  /*
   * Writes the value to the cache, with the key.
   *
   * @param name {String} - cache key
   * @param data
   * @param opts {Object} - Accepts ttl {int}
   * @param doneCallback {Function} - receives data
   *
   * This method can be called in two ways:
   *  write(name, data, opts, doneCallback);
   *  write(name, data, doneCallback);
   */
  write: function(name, data, opts, doneCallback) {
    throw new Utils.Exception('CacheStore#write not implemented');
  },

  /*
   * Deletes an entry in the cache. Returns true if an entry is deleted.
   *
   * @param name {String} - cache key
   * @param doneCallback {Function}
   */
  delete: function(name, doneCallback) {
    throw new Utils.Exception('CacheStore#delete not implemented');
  },

  /*
   * Cleanup the cache by removing expired entries.
   *
   * @param doneCallback {Function}
   */
  cleanup: function(doneCallback) {
    throw new Utils.Exception('CacheStore#cleanup not implemented');
  },

  /*
   * Clear the entire cache.
   *
   * @param doneCallback {Function}
   */
  clear: function(doneCallback) {
    throw new Utils.Exception('CacheStore#clear not implemented');
  }

}

module.exports = CacheStore;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
var Mappersmith = (typeof window !== "undefined" ? window.Mappersmith : typeof global !== "undefined" ? global.Mappersmith : null);
var Utils = Mappersmith.Utils;
var CacheStore = require('./cache-store');

module.exports = function(methods) {
  var newCacheStore = function() {
    CacheStore.apply(this, arguments);
    this.init && this.init();
  }

  newCacheStore.prototype = Utils.extend({}, CacheStore.prototype, methods);
  return newCacheStore;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cache-store":2}],4:[function(require,module,exports){
(function (global){
var Mappersmith = (typeof window !== "undefined" ? window.Mappersmith : typeof global !== "undefined" ? global.Mappersmith : null);
var Utils = Mappersmith.Utils;
var LocalStorageCacheStore = require('./local-storage-cache-store');

module.exports = function(TransportGateway, CacheStore, cacheStoreOpts) {
  if (typeof TransportGateway === 'object') {
    cacheStoreOpts = TransportGateway;
    TransportGateway = undefined;

  } else if (typeof CacheStore === 'object') {
    cacheStoreOpts = CacheStore;
    CacheStore = undefined;
  }

  TransportGateway = TransportGateway || Mappersmith.VanillaGateway;
  CacheStore = CacheStore || LocalStorageCacheStore;
  cacheStoreOpts = Utils.extend({}, cacheStoreOpts);

  var store = new CacheStore(cacheStoreOpts);
  var GatewayClass = Mappersmith.createGateway(Utils.extend({}, TransportGateway.prototype, {

    get: function() {
      var cacheOpts = Utils.extend({}, this.opts.cache);
      store.fetch(this.url, {
        request: function() {
          TransportGateway.prototype.get.apply(this);
        }.bind(this),

        gatewayInstance: this,
        cacheOpts: cacheOpts
      });
    }

  }));

  GatewayClass.cacheStore = store;
  return GatewayClass;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./local-storage-cache-store":5}],5:[function(require,module,exports){
(function (global){
var Utils = (typeof window !== "undefined" ? window.Mappersmith : typeof global !== "undefined" ? global.Mappersmith : null).Utils;
var CreateCacheStore = require('./create-cache-store');

var LocalStorageCacheStore = CreateCacheStore({
  init: function() {
    this.storage = window.localStorage;
  },

  read: function(name, callback) {
    this._async(function() {
      var data = this._syncRead(name);
      if (data == null) return callback(null);

      if (data.ttl < Date.now()) {
        this.delete(name);
        callback(null);

      } else {
        callback(data.value);
      }
    });
  },

  write: function(name, data, opts, doneCallback) {
    if (typeof opts === 'function') {
      doneCallback = opts;
      opts = {};
    }

    this._async(function() {
      this._syncWrite(name, data, opts);
      if (!!doneCallback) doneCallback();
    });
  },

  delete: function(name, doneCallback) {
    this._async(function() {
      this._syncDelete(name);
      if (!!doneCallback) doneCallback();
    });
  },

  cleanup: function(doneCallback) {
    this._async(function() {
      this._eachCacheKey(function(cacheKey) {
        var data = this._syncRead(cacheKey);
        if (data.ttl < Date.now()) {
          this._syncDelete(cacheKey);
        }
      });

      if (!!doneCallback) doneCallback();
    });
  },

  clear: function(doneCallback) {
    this._async(function() {
      this._eachCacheKey(function(cacheKey) { this._syncDelete(cacheKey) });
      if (!!doneCallback) doneCallback();
    });
  },

  _syncDelete: function(name) {
    var cacheKey = this.cacheKey(name);
    this.storage.removeItem(cacheKey);
  },

  _syncRead: function(name) {
    var cacheKey = this.cacheKey(name);
    var rawData = this.storage.getItem(cacheKey);

    return rawData == null ? null : JSON.parse(rawData);
  },

  _syncWrite: function(name, data, opts) {
    var cacheKey = this.cacheKey(name);
    var ttl = this.resolveTTL(opts);

    this.storage.setItem(
      cacheKey,
      JSON.stringify({
        ttl: Date.now() + ttl,
        value: data
      })
    );
  },

  _eachCacheKey: function(eachCallback) {
    Object.keys(this.storage).
    filter(function(key) { return this.isCacheKey(key) }.bind(this)).
    forEach(eachCallback.bind(this));
  },

  _async: function(callback) {
    setTimeout(function() { callback.apply(this) }.bind(this), 1);
  }
});

module.exports = LocalStorageCacheStore;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./create-cache-store":3}],6:[function(require,module,exports){
(function (global){
var Utils = (typeof window !== "undefined" ? window.Mappersmith : typeof global !== "undefined" ? global.Mappersmith : null).Utils;
var LocalStorageCacheStore = require('./local-storage-cache-store');
var CreateCacheStore = require('./create-cache-store');

var SessionStorageCacheStore = CreateCacheStore(
  Utils.extend({}, LocalStorageCacheStore.prototype, {
    init: function() {
      this.storage = window.sessionStorage;
    }
  })
);

module.exports = SessionStorageCacheStore;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./create-cache-store":3,"./local-storage-cache-store":5}]},{},[1])(1)
});