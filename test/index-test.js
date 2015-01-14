var expect = chai.expect;

describe('MappersmithCachedGateway', function() {

  it('exposes CacheStore', function() {
    expect(MappersmithCachedGateway.CacheStore).to.exist();
  });

  it('exposes LocalstorageCacheStore', function() {
    expect(MappersmithCachedGateway.LocalstorageCacheStore).to.exist();
  });

  it('exposes method createCachedGateway', function() {
    expect(MappersmithCachedGateway.createCachedGateway).to.exist();
  });

  it('exposes method createCacheStore', function() {
    expect(MappersmithCachedGateway.createCacheStore).to.exist();
  });

});
