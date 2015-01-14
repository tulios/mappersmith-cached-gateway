var Mappersmith = require('mappersmith');
var Utils = Mappersmith.Utils;
var CacheStore = require('./cache-store');

module.exports = function(methods) {
  var newCacheStore = function() {
    CacheStore.apply(this, arguments);
    this.init && this.init();
  }

  newCacheStore.prototype = Utils.extend({}, CacheStore.prototype, methods);
  return newCacheStore;
}
