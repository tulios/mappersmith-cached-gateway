var expect = chai.expect;
var Utils = Mappersmith.Utils;
var CacheStore = MappersmithCachedGateway.CacheStore;
var LocalStorageCacheStore = MappersmithCachedGateway.LocalStorageCacheStore;

describe('LocalStorageCacheStore', function() {
  var fakeTimer,
      cache,
      entryName,
      entryValue;

  beforeEach(function() {
    fakeTimer = sinon.useFakeTimers();
    entryName = 'test-localstorage';
    entryValue = 'test-value-localstorage';

    cache = new LocalStorageCacheStore();
    cache.clear();
  });

  afterEach(function() {
    fakeTimer.restore();
  });

  describe('constructor', function() {
    it('holds a reference for window.localStorage', function() {
      expect(cache.storage).to.be.equal(window.localStorage);
    });
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

    it('deletes all expired entries', function() {
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
      localStorage.setItem('alien1', 'alien1');
      localStorage.setItem('alien2', 'alien2');
      cache.write(entryName, entryValue);
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.not.be.null;
    });

    afterEach(function() {
      localStorage.removeItem('alien1');
      localStorage.removeItem('alien2');
    });

    it('deletes all entries', function() {
      cache.clear();
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.be.null;
      expect(localStorage.getItem('alien1')).to.equal('alien1');
      expect(localStorage.getItem('alien2')).to.equal('alien2');
    });

    it('calls the doneCallback', function() {
      var doneCallback = sinon.spy(function(){});
      cache.clear(doneCallback);
      fakeTimer.tick(1);
      expect(doneCallback).to.have.been.called;
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
        fakeTimer.tick(1);
      });
    });

    describe('with a valid entry', function() {
      beforeEach(function() {
        cache.write(entryName, entryValue);
        fakeTimer.tick(1);

        var value = localStorage.getItem(cache.cacheKey(entryName));
        expect(value).to.not.be.null;
      });

      it('returns the persisted value', function(done) {
        cache.read(entryName, function(data) {
          expect(data).to.equal(entryValue);
          done();
        });
        fakeTimer.tick(1);
      });
    });

    describe('with expired entry', function() {
      beforeEach(function() {
        cache.write(entryName, entryValue, {ttl: 1});
        fakeTimer.tick(1);

        var value = localStorage.getItem(cache.cacheKey(entryName));
        expect(value).to.not.be.null;
      });

      it('deletes the expired entry and calls the callback with null', function(done) {
        sinon.spy(cache, 'delete');

        fakeTimer.tick(5);
        cache.read(entryName, function(data) {
          expect(data).to.be.null;
          expect(cache.delete).to.have.been.calledWith(entryName);
          done();
        });
        fakeTimer.tick(1);
      });
    });
  });

  describe('#write', function() {
    describe('without a TTL', function() {
      it('persists value with default TTL', function() {
        cache.write(entryName, entryValue);
        fakeTimer.tick(1);

        var data = localStorage.getItem(cache.cacheKey(entryName));
        expect(data).to.not.be.null;
        data = JSON.parse(data);

        expect(data).to.have.property('ttl', Date.now() + cache.ttl);
        expect(data).to.have.property('value', entryValue);
      });
    });

    describe('with TTL', function() {
      it('persists value with informed TTL', function() {
        var ttl = 5;
        cache.write(entryName, entryValue, {ttl: ttl});
        fakeTimer.tick(1);

        var data = localStorage.getItem(cache.cacheKey(entryName));
        expect(data).to.not.be.null;
        data = JSON.parse(data);

        expect(data).to.have.property('ttl', Date.now() + ttl);
        expect(data).to.have.property('value', entryValue);
      });
    });

    it('calls the doneCallback', function() {
      var doneCallback = sinon.spy(function(){});

      cache.write(entryName, entryValue, doneCallback);
      fakeTimer.tick(1);
      expect(doneCallback).to.have.been.called;
    });
  });

  describe('#delete', function() {
    beforeEach(function() {
      cache.write(entryName, entryValue);
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.not.be.null;
    });

    it('deletes the entry', function() {
      cache.delete(entryName);
      fakeTimer.tick(1);

      var value = localStorage.getItem(cache.cacheKey(entryName));
      expect(value).to.be.null;
    });
  });

});
