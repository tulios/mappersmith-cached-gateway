var Utils = require('mappersmith').Utils;
var CreateCacheStore = require('./create-cache-store');

var redis = require('redis');

var NodeRedisCacheStore = CreateCacheStore({
  init: function() {
    this.redisOptions = Utils.extend({}, this.options.redis);
    this.logger = this.redisOptions.logger || console;
    this.storage = redis.createClient.apply(this, this.redisOptions.client);
    this.storage.on('error', this._redisOnError.bind(this));
  },

  read: function(name, callback) {
    var cacheKey = this.cacheKey(name);
    this.storage.get(cacheKey, function(err, rawData) {

      if (err) {
        this._redisOnError('#read ' + err);

        // In case of error is better send data as null to
        // release the call
        callback(null);

      } else {
        var data = JSON.parse(rawData);
        callback(data ? data.value : data);
      }

    }.bind(this));
  },

  write: function(name, data, opts, doneCallback) {
    if (typeof opts === 'function') {
      doneCallback = opts;
      opts = {};
    }

    var ttl = this.resolveTTL(opts);
    var cacheKey = this.cacheKey(name);
    var payload = JSON.stringify({value: data});

    this.storage.setex(
      cacheKey,
      ttl,
      payload,
      this._newDoneCallback('write', doneCallback)
    );
  },

  delete: function(name, doneCallback) {
    var cacheKey = this.cacheKey(name);
    this.storage.del(
      cacheKey,
      this._newDoneCallback('delete', doneCallback)
    );
  },

  /*
   * No op. Redis will automatically remove the expired keys.
   */
  cleanup: function(doneCallback) {
    if (doneCallback) doneCallback();
  },

  clear: function(doneCallback) {
    var clearPattern = this.cacheKey('*');
    this.storage.keys(clearPattern, function(err, keys) {

      if (err) {
        this._redisOnError('#clear ' + err);

      } else {
        this.storage.del(
          keys,
          this._newDoneCallback('clear', doneCallback)
        );
      }

    }.bind(this));
  },

  _newDoneCallback: function(operation, doneCallback) {
    return function(err) {
      if (err) {
        this._redisOnError('#' + operation + ' ' + err);

      } else {
        if (doneCallback) doneCallback();
      }
    }.bind(this)
  },

  _redisOnError: function(err) {
    if (this.logger) this.logger.error('[NodeRedisCacheStore] ' + err);
    if (this.redisOptions.onError) this.redisOptions.onError(err);
  }
});

module.exports = NodeRedisCacheStore;
