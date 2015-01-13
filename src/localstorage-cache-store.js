var Utils = require('mappersmith').Utils;
var CacheStore = require('./cache-store');

var LocalstorageCacheStore = function() {
  CacheStore.apply(this, arguments);

  this.localStorage = window.localStorage;
  this.supported = (function() {
    var test = 'test';
    try {
      this.localStorage.setItem(test, test);
      this.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }.bind(this))();
}

LocalstorageCacheStore.prototype = Utils.extend({}, CacheStore.prototype, {

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

    var options = Utils.extend({ttl: this.ttl}, opts);

    this._async(function() {
      var cacheKey = this.cacheKey(name);
      var ttl = parseInt(options.ttl, 10);
      if (isNaN(ttl)) ttl = this.ttl;

      this.localStorage.setItem(
        cacheKey,
        JSON.stringify({
          ttl: Date.now() + ttl,
          value: data
        })
      );

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
    this.localStorage.removeItem(cacheKey);
  },

  _syncRead: function(name) {
    var cacheKey = this.cacheKey(name);
    var rawData = this.localStorage.getItem(cacheKey);

    return rawData == null ? null : JSON.parse(rawData);
  },

  _eachCacheKey: function(eachCallback) {
    Object.keys(this.localStorage).
      filter(function(key) { return this.isCacheKey(key) }.bind(this)).
      forEach(eachCallback.bind(this));
  },

  _async: function(callback) {
    setTimeout(function() { callback.apply(this) }.bind(this), 1);
  }

});

module.exports = LocalstorageCacheStore;
