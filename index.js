var Mappersmith = require('mappersmith');
var LocalstorageCacheStore = require('./src/localstorage-cache-store');

module.exports = {
  CacheStore: require('./src/cache-store'),

  createCachedGateway: require('./src/create-cached-gateway'),

  newCachedGateway: function(TransportGateway, CacheStore) {
    var Transport = TransportGateway || Mappersmith.VanillaGateway;
    var Store = CacheStore || LocalstorageCacheStore;
    return this.createCachedGateway(Transport, Store);
  },

  createCacheStore: function() {

  }
}
