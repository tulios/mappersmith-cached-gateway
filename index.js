var Mappersmith = require('mappersmith');

module.exports = {
  CacheStore: require('./src/cache-store'),
  LocalstorageCacheStore: require('./src/localstorage-cache-store'),
  /*
   * Creates a new gateway based on the informed transportGateway that will
   * use the informed cacheStore to cache the data.
   *
   * args:
   * @param TransportGateway {Mappersmith.Gateway}
   * @param CacheStore {MappersmithCachedGateway.CacheStore}
   *
   * The new gateway will accept the following opts:
   *  cache - an object with the key ttl in seconds
   *  writeCallback - callback to be used as write doneCallback
   */
  createCachedGateway: require('./src/create-cached-gateway'),

  newCachedGateway: function(TransportGateway, CacheStore) {
    var Transport = TransportGateway || Mappersmith.VanillaGateway;
    var Store = CacheStore || this.LocalstorageCacheStore;
    return this.createCachedGateway(Transport, Store);
  },

  createCacheStore: function() {

  }
}
