var Mappersmith = require('mappersmith');
var Utils = Mappersmith.Utils;

module.exports = function(TransportGateway, CacheStore) {

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
