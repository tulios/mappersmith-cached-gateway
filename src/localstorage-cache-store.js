var Utils = require('mappersmith').Utils;
var CacheStore = require('./cache-store');

var LocalstorageCacheStore = function() {
  return CacheStore.apply(this, arguments);
}

LocalstorageCacheStore.prototype = Utils.extend({}, CacheStore.prototype, {

  read: function() {

  },

  write: function() {

  },

  delete: function() {

  },

  isAvailable: function() {
    
  }

});

module.exports = LocalstorageCacheStore;
