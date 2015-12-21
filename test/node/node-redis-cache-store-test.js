require('./test-helper');
var rewire = require("rewire");
var NodeRedisCacheStore = rewire('../../src/node-redis-cache-store');

describe('NodeRedisCacheStore', function() {
  var cache,
      entryName,
      entryValue,
      client,
      restore;

  var fakeredis = require('fakeredis');
  var redis = require('redis');

  beforeEach(function(done) {
    client = fakeredis.createClient();
    client.flushdb(function(err) { done() });

    sinon.stub(redis, 'createClient', function() { return client });
    restore = NodeRedisCacheStore.__set__('redis', redis);

    entryName = 'test-redis';
    entryValue = 'test-redis';

    cache = new NodeRedisCacheStore();
    cache.logger = false;
  });

  afterEach(function() {
    redis.createClient.restore();
    restore();
  });

  describe('constructor', function() {
    var opts, logger, onErrorCallback;

    beforeEach(function() {
      logger = 'my-logger';
      opts = {logger: logger, client: [6379, '127.0.0.1', {max_attempts: 5}]};
      cache = new NodeRedisCacheStore({redis: opts});
    });

    it('holds a reference of redis options at "redisOptions" attribute', function() {
      expect(cache.redisOptions).to.deep.equal(opts);
    });

    it('holds a reference of redis client at "storage"', function() {
      expect(cache.storage).to.eql(client)
    });

    it('accepts a custom logger at "redis.logger" attribute', function() {
      expect(cache.logger).to.equal(logger);
    });

    it('calls method "auth" if attribute "redis.password" is defined', function() {
      var password = '123';
      sinon.spy(client, 'auth');
      cache = new NodeRedisCacheStore({redis: {password: password}});
      expect(client.auth).to.have.been.calledWith(password);
      client.auth.restore();
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
        client.del(cache.cacheKey(entryName));

        client.get(cache.cacheKey(entryName), function(err, value) {
          expect(value).to.be.null;
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

      it('calls the doneCallback', function(done) {
        cache.write(entryName, entryValue, function() {
          done();
        });
      });
    });

    describe('in case of error', function() {
      beforeEach(function() {
        cache.storage.setex = sinon.stub().callsArgWith(3, 'error');
      });

      it('calls "_redisOnError"', function() {
        sinon.spy(cache, '_redisOnError');
        var doneCallback = sinon.spy(function(){});
        cache.write(entryName, entryValue, doneCallback);
        expect(cache._redisOnError).to.have.been.called;
        expect(doneCallback).to.not.have.been.called;
      });
    });
  });

  describe('#delete', function() {
    beforeEach(function(done) {
      cache.write(entryName, entryValue);
      client.get(cache.cacheKey(entryName), function(err, value) {
        expect(value).to.not.be.null;
        done();
      });
    });

    it('deletes the entry', function(done) {
      cache.delete(entryName);
      client.get(cache.cacheKey(entryName), function(err, value) {
        expect(value).to.be.null;
        done();
      });
    });

    describe('in case of error', function() {
      beforeEach(function() {
        cache.storage.del = sinon.stub().callsArgWith(1, 'error');
      });

      it('calls "_redisOnError"', function() {
        sinon.spy(cache, '_redisOnError');
        var doneCallback = sinon.spy(function(){});
        cache.delete(entryName, doneCallback);
        expect(cache._redisOnError).to.have.been.called;
        expect(doneCallback).to.not.have.been.called;
      });
    });
  });

  describe('#cleanup', function() {
    it('calls the doneCallback', function() {
      var doneCallback = sinon.spy(function(){});
      cache.cleanup(doneCallback);
      expect(doneCallback).to.have.been.called;
    });
  });

  describe('#clear', function() {
    it('deletes all entries in the namespace', function(done) {
      client.set('alien1', 'alien1');
      client.set('alien2', 'alien2');
      cache.write(entryName, entryValue);

      client.keys('*', function(err, keys1) {
        expect(keys1.length).to.equal(3);
        cache.clear(function() {

          client.keys('*', function(err, keys2) {
            expect(keys2.length).to.equal(2);
            cache.read(entryName, function(value) {
              expect(value).to.be.null;
              done();
            });
          });

        });
      });
    });

    describe('in case of error', function() {
      describe('with keys', function() {
        beforeEach(function() {
          cache.storage.keys = sinon.stub().callsArgWith(1, 'error');
        });

        it('calls "_redisOnError"', function() {
          sinon.spy(cache, '_redisOnError');
          var doneCallback = sinon.spy(function(){});
          cache.clear(doneCallback);
          expect(cache._redisOnError).to.have.been.called;
          expect(doneCallback).to.not.have.been.called;
        });
      });

      describe('with del', function() {
        beforeEach(function() {
          cache.storage.keys = sinon.stub().callsArgWith(1, null, ['key']);
          cache.storage.del = sinon.stub().callsArgWith(1, 'error');
        });

        it('calls "_redisOnError"', function() {
          sinon.spy(cache, '_redisOnError');
          var doneCallback = sinon.spy(function(){});
          cache.clear(doneCallback);
          expect(cache._redisOnError).to.have.been.called;
          expect(doneCallback).to.not.have.been.called;
        });
      });
    });
  });

  describe('#_redisOnError', function() {
    describe('with a custom onError callback', function() {
      it('calls the configured callback', function() {
        var error = 'error msg';
        var onErrorCallback = sinon.spy(function(){});

        cache.redisOptions.onError = onErrorCallback;
        cache._redisOnError(error);
        expect(onErrorCallback).to.have.been.calledWith(error);
      });
    });
  });

});
