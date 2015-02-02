require('./test-helper');
var MappersmithCachedGateway = require('../../node');

describe('NodeRedisCacheStore', function() {
  var NodeRedisCacheStore,
      cache,
      entryName,
      entryValue,
      client;

  var fakeredis = require('fakeredis');
  var redis = require('redis');

  before(function() {
    sinon.stub(redis, 'createClient', fakeredis.createClient);
  });

  after(function() {
    redis.createClient.restore();
  });

  beforeEach(function(done) {
    NodeRedisCacheStore = MappersmithCachedGateway.node.NodeRedisCacheStore;
    entryName = 'test-redis';
    entryValue = 'test-redis';

    client = redis.createClient();
    cache = new NodeRedisCacheStore();
    client.flushdb(function(err) { done() });
  });

  describe('constructor', function() {
    var opts;

    beforeEach(function() {
      opts = {client: [6379, '127.0.0.1', {max_attempts: 5}]};
      cache = new NodeRedisCacheStore({redis: opts});
    });

    it('holds a reference of redis options at "redisOptions" attribute', function() {
      expect(cache.redisOptions).to.deep.equal(opts);
    });

    it('holds a reference of redis client at "storage"', function() {
      expect(cache.storage).to.be.instanceof(redis.RedisClient);
    });
  });

  describe('#read', function() {
    describe('without entry', function() {
      beforeEach(function() {
        entryName = 'invalid';
      });

      it('calls the callback with null', function(done) {
        cache.read(entryName, function(data) {
          expect(data).to.be.null;
          done();
        });
      });
    });

    // describe('with a valid entry', function() {
    //   beforeEach(function(done) {
    //     cache.write(entryName, entryValue);
    //
    //     client.get(cache.cacheKey(entryName), function(err, value) {
    //       expect(value).to.not.be.null;
    //       done();
    //     });
    //   });
    //
    //   it('returns the persisted value', function(done) {
    //     cache.read(entryName, function(data) {
    //       expect(data).to.equal(entryValue);
    //       done();
    //     });
    //   });
    // });
    //
    // describe('with expired entry', function() {
    //   beforeEach(function(done) {
    //     cache.write(entryName, entryValue);
    //     client.expire(cache.cacheKey(entryName));
    //
    //     client.get(cache.cacheKey(entryName), function(err, value) {
    //       expect(value).to.not.be.null;
    //       done();
    //     });
    //   });
    //
    //   it('calls the callback with null', function(done) {
    //     cache.read(entryName, function(data) {
    //       expect(data).to.be.null;
    //       done();
    //     });
    //   });
    // });
  });

});
