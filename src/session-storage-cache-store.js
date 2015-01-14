var Utils = require('mappersmith').Utils;
var LocalStorageCacheStore = require('./local-storage-cache-store');
var CreateCacheStore = require('./create-cache-store');

var SessionStorageCacheStore = CreateCacheStore(
  Utils.extend({}, LocalStorageCacheStore.prototype, {
    init: function() {
      this.storage = window.sessionStorage;
    }
  })
);

module.exports = SessionStorageCacheStore;
