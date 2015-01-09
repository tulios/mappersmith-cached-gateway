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
      var cacheKey = this._cacheKey(name);
      var rawData = this.localStorage.getItem(cacheKey);

      if (rawData === null || rawData === undefined) {
        return callback(null);
      }

      var data = JSON.parse(rawData);

      if (data.ttl < Date.now()) {
        this.delete(name);
        callback(null);

      } else {
        callback(data.value);
      }
    });
  },

  write: function(name, data, opts, doneCallback) {
    this._async(function() {
      var cacheKey = this._cacheKey(name);
      var ttl = parseInt(opts.ttl, 10);
      if (isNaN(ttl)) ttl = 0;

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
      var cacheKey = this._cacheKey(name);
      this.localStorage.removeItem(cacheKey);
      if (!!doneCallback) doneCallback();
    });
  },

  _cacheKey: function(key) {
    return 'mappersmith_cache:' + key;
  },

  _async: function(callback) {
    setTimeout(function() { callback.apply(this) }.bind(this), 1);
  }

});

module.exports = LocalstorageCacheStore;
