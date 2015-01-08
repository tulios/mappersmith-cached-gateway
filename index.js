var Mappersmith = require('mappersmith');
var CreateCachedGateway = require('./src/create-cached-gateway');
var LocalstorageCacheStore = require('./src/localstorage-cache-store');

module.exports = function(TransportGateway, CacheStore) {
  var Store = CacheStore || LocalstorageCacheStore;
  return CreateCachedGateway(TransportGateway, Store);
}
