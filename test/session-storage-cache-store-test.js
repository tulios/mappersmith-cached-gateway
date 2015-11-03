var Mappersmith = require('mappersmith');
var MappersmithCachedGateway = require('../index');

var LocalStorageCacheStore = MappersmithCachedGateway.LocalStorageCacheStore;
var SessionStorageCacheStore = MappersmithCachedGateway.SessionStorageCacheStore;

describe('SessionStorageCacheStore', function() {

  describe('constructor', function() {
    it('holds a reference for window.sessionStorage', function() {
      var cache = new SessionStorageCacheStore();
      expect(cache.storage).to.be.equal(window.sessionStorage);
    });
  });

  it('inherits from LocalStorageCacheStore', function() {
    Object.getOwnPropertyNames(LocalStorageCacheStore.prototype).
    filter(function(property) { return property !== 'init' }).
    forEach(function(property) {
      expect(SessionStorageCacheStore.prototype).to.have.property(
        property,
        LocalStorageCacheStore.prototype[property]
      );
    });
  });

});
