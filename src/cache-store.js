var Utils = require('mappersmith').Utils;

var CacheStore = function() {
}

CacheStore.prototype = {

  /*
   * Fetches data from the cache, using the given key. If there is data in
   * the cache with the given key, then that data is returned.
   *
   * If there is no such data in the cache (a cache miss), then +nil+ will be
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
   *  - opts: options for cache store
   */
  fetch: function(name, opts) {
    var gateway = opts.gatewayInstance;
    this.read(name, function(data) {
      if (data === null) {
        var hasProcessor = gateway.processor !== undefined;
        var originalProcessor = gateway.processor || function(data) { return data };
        var wrappedProcessor = function(newData) {
          this.write(name, newData, opts.cacheOpts, opts.writeCallback);
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
   * @param opts {Object} - Accepts ttl {Int}
   * @param doneCallback {Function} - receives data
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
   * Returns true if the cache contains an entry for the given key.
   *
   * @param name {String}
   * @param callback {Function} - receives true/false
   */
  isAvailable: function(name, callback) {
    this.read(name, function(data) {
      callback(data === null);
    });
  },

  /*
   * Cleanup the cache by removing expired entries.
   */
  cleanup: function() {

  },

  /*
   * Clear the entire cache.
   */
  clear: function() {

  }

}

module.exports = CacheStore;
