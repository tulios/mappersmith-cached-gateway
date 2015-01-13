var expect = chai.expect;
var Mappersmith = require('mappersmith');
var Utils = Mappersmith.Utils;
var CacheStore = MappersmithCachedGateway.CacheStore;
var LocalstorageCacheStore = MappersmithCachedGateway.LocalstorageCacheStore;

describe('LocalstorageCacheStore', function() {
  var fakeTimer,
      cache,
      entryName,
      entryValue;

  beforeEach(function() {
    fakeTimer = sinon.useFakeTimers();
    entryName = 'test-localstorage';
    entryValue = 'test-value-localstorage';

    cache = new LocalstorageCacheStore();
    cache.clear();
  });

  afterEach(function() {
    fakeTimer.restore();
  });

  describe('#cleanup', function() {
    var entryName2;

    beforeEach(function() {
      entryName2 = entryName + '2';

      cache.write(entryName, entryValue, {ttl: 2});
      fakeTimer.tick(1);
      cache.write(entryName2, entryValue, {ttl: 10});
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.not.be.null;

      value = localStorage.getItem(cache.cacheKey(entryName2));
      expect(value).to.not.be.null;
    });

    it('deletes all expired keys', function() {
      fakeTimer.tick(2);
      cache.cleanup();
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.be.null;

      value = localStorage.getItem(cache.cacheKey(entryName2));
      expect(value).to.not.be.null;
    });

    it('calls the doneCallback', function() {
      var doneCallback = sinon.spy(function(){});
      cache.cleanup(doneCallback);
      fakeTimer.tick(1);
      expect(doneCallback).to.have.been.called;
    });
  });

  describe('#clear', function() {
    beforeEach(function() {
      cache.write(entryName, entryValue);
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.not.be.null;
    });

    it('deletes all keys', function() {
      cache.clear();
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.be.null;
    });

    it('calls the doneCallback', function() {
      var doneCallback = sinon.spy(function(){});
      cache.clear(doneCallback);
      fakeTimer.tick(1);
      expect(doneCallback).to.have.been.called;
    });
  });

});
