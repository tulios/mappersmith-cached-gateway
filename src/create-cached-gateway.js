var Mappersmith = require('mappersmith');
var Utils = Mappersmith.Utils;
var LocalStorageCacheStore = require('./local-storage-cache-store');

module.exports = function(TransportGateway, CacheStore) {
  TransportGateway = TransportGateway || Mappersmith.VanillaGateway;
  CacheStore = CacheStore || LocalStorageCacheStore;

  var store = new CacheStore();

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
