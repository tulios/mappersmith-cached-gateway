var MappersmithCachedGateway = require('../index');

describe('MappersmithCachedGateway', function() {

  it('exposes CacheStore', function() {
    expect(MappersmithCachedGateway.CacheStore).to.exist();
  });

  it('exposes LocalStorageCacheStore', function() {
    expect(MappersmithCachedGateway.LocalStorageCacheStore).to.exist();
  });

  it('exposes SessionStorageCacheStore', function() {
    expect(MappersmithCachedGateway.SessionStorageCacheStore).to.exist();
  });

  it('exposes method createCachedGateway', function() {
    expect(MappersmithCachedGateway.createCachedGateway).to.exist();
  });

  it('exposes method createCacheStore', function() {
    expect(MappersmithCachedGateway.createCacheStore).to.exist();
  });

});
