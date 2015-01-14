module.exports = {
  CacheStore: require('./src/cache-store'),
  LocalstorageCacheStore: require('./src/localstorage-cache-store'),

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
