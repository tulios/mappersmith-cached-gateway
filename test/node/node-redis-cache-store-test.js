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
    client.flushdb(function(err) { done() });

    cache = new NodeRedisCacheStore();
    cache.storage = client;
    cache.logger = false;
  });

  describe('constructor', function() {
    var opts, logger;

    beforeEach(function() {
      logger = 'my-logger';
      opts = {client: [6379, '127.0.0.1', {max_attempts: 5}]};
      cache = new NodeRedisCacheStore({logger: logger, redis: opts});
    });

    it('holds a reference of redis options at "redisOptions" attribute', function() {
      expect(cache.redisOptions).to.deep.equal(opts);
    });

    it('holds a reference of redis client at "storage"', function() {
      expect(cache.storage).to.be.instanceof(redis.RedisClient);
    });

    it('accepts a custom logger at "logger" attribute', function() {
      expect(cache.logger).to.equal(logger);
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

    describe('with a valid entry', function() {
      beforeEach(function(done) {
        cache.write(entryName, entryValue);
        client.get(cache.cacheKey(entryName), function(err, value) {
          expect(value).to.not.be.null;
          done();
        });
      });

      it('returns the persisted value', function(done) {
        cache.read(entryName, function(data) {
          expect(data).to.equal(entryValue);
          done();
        });
      });
    });

    describe('with expired entry', function() {
      beforeEach(function(done) {
        cache.write(entryName, entryValue);
        client.expire(cache.cacheKey(entryName), 0);

        client.get(cache.cacheKey(entryName), function(err, value) {
          expect(value).to.not.be.null;
          done();
        });
      });

      it('calls the callback with null', function(done) {
        cache.read(entryName, function(data) {
          expect(data).to.be.null;
          done();
        });
      });
    });

    describe('in case of error', function() {
      beforeEach(function() {
        cache.storage.get = sinon.stub().callsArgWith(1, 'error');
      });

      it('calls "_redisOnError" and callback with null', function() {
        sinon.spy(cache, '_redisOnError');
        var callback = sinon.spy(function(){});
        cache.read('cacheKey', callback);
        expect(cache._redisOnError).to.have.been.called;
        expect(callback).to.have.been.calledWith(null);
      });
    });
  });

  describe('#write', function() {
    describe('without a TTL', function() {
      it('persists value with default TTL', function(done) {
        cache.write(entryName, entryValue);
        client.ttl(cache.cacheKey(entryName), function(err, ttl) {
          expect(ttl).to.equal(cache.ttl);

          client.get(cache.cacheKey(entryName), function(err, value) {
            expect(value).to.not.be.null;
            var data = JSON.parse(value);
            expect(data).to.have.property('value', entryValue);
            done();
          });
        });
      });
    });

    describe('with TTL', function() {
      it('persists value with informed TTL', function(done) {
        var configuredTTL = 50;
        cache.write(entryName, entryValue, {ttl: configuredTTL});
        client.ttl(cache.cacheKey(entryName), function(err, ttl) {
          expect(ttl).to.equal(configuredTTL);

          client.get(cache.cacheKey(entryName), function(err, value) {
            expect(value).to.not.be.null;
            var data = JSON.parse(value);
            expect(data).to.have.property('value', entryValue);
            done();
          });
        });
      });

      it('calls the doneCallback', function() {
        cache.write(entryName, entryValue, function() {
          done();
        });
      });
    });
  });

});
