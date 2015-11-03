var Mappersmith = require('mappersmith');
var MappersmithCachedGateway = require('../index');

var Utils = Mappersmith.Utils;
var CacheStore = MappersmithCachedGateway.CacheStore;
var createCacheStore = MappersmithCachedGateway.createCacheStore;

describe('#createCacheStore', function() {

  it('creates a new class that inherits from CacheStore', function() {
    var otherCacheStore = createCacheStore();

    Object.getOwnPropertyNames(CacheStore.prototype).
    forEach(function(property) {
      expect(otherCacheStore.prototype).to.have.property(
        property,
        CacheStore.prototype[property]
      );
    });
  });

  it('accepts a "init" method to be used as a constructor', function() {
    var obj = {myConstructor: Utils.noop};
    var myConstructor = sinon.spy(obj, 'myConstructor');
    var otherCacheStore = createCacheStore({init: myConstructor});

    new otherCacheStore();
    expect(myConstructor).to.have.been.called;
  });

});
