var Mappersmith = require('mappersmith');
var Utils = Mappersmith.Utils;
var LocalStorageCacheStore = require('./local-storage-cache-store');

module.exports = function(TransportGateway, CacheStore, cacheStoreOpts) {
  if (typeof TransportGateway === 'object') {
    cacheStoreOpts = TransportGateway;
    TransportGateway = undefined;

  } else if (typeof CacheStore === 'object') {
    cacheStoreOpts = CacheStore;
    CacheStore = undefined;
  }

  TransportGateway = TransportGateway || Mappersmith.VanillaGateway;
  CacheStore = CacheStore || LocalStorageCacheStore;
  cacheStoreOpts = Utils.extend({}, cacheStoreOpts);

  var store = new CacheStore(cacheStoreOpts);

  return Mappersmith.createGateway(Utils.extend({}, TransportGateway.prototype, {

    get: function() {
      var cacheOpts = Utils.extend({}, this.opts.cache);
      store.fetch(this.url, {
        request: function() {
          TransportGateway.prototype.get.apply(this);
        }.bind(this),

        gatewayInstance: this,
        cacheOpts: cacheOpts
      });
    }

  }));
}
