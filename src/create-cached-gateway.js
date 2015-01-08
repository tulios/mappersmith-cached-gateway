var Mappersmith = require('mappersmith');
var Utils = Mappersmith.Utils;

module.exports = function(TransportGateway, CacheStore) {
  return Mappersmith.createGateway(Utils.extend({}, TransportGateway.prototype, {

    get: function() {
      TransportGateway.prototype.get.apply(this);
    }

  }));

}
