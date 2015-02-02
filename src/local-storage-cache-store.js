var Utils = require('mappersmith').Utils;
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
      if (!!doneCallback) doneCallback(data);
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
