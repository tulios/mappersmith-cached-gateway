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
   * @param opts {Object}
   * @param success {Function}
   */
  fetch: function(name, opts, success) {

  },

  /*
   * Fetches data from the cache, using the given key. If there is data in
   * the cache with the given key, then that data is returned. Otherwise,
   * null is returned.
   */
  read: function(name) {
    throw new Utils.Exception('CacheStore#read not implemented');
  },

  /*
   * Writes the value to the cache, with the key.
   */
  write: function(name) {
    throw new Utils.Exception('CacheStore#write not implemented');
  },

  /*
   * Deletes an entry in the cache. Returns true if an entry is deleted.
   */
  delete: function(name) {
    throw new Utils.Exception('CacheStore#delete not implemented');
  },

  /*
   * Returns true if the cache contains an entry for the given key.
   *
   * @param name {String}
   */
  isAvailable: function(name) {
    throw new Utils.Exception('CacheStore#isAvailable not implemented');
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
