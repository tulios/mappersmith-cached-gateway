var Utils = require('mappersmith').Utils;

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
