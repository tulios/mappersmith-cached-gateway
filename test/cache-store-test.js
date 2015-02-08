var expect = chai.expect;
var Utils = Mappersmith.Utils;
var CacheStore = MappersmithCachedGateway.CacheStore;

describe('CacheStore', function() {
  var fakeTimer,
      fakeServer,
      cache,
      gateway,
      processor,
      success,
      data,
      readData;

  function newGateway(opts) {
    return new Mappersmith.VanillaGateway(Utils.extend({
      url: 'http://full-url',
      method: 'get',
      processor: processor
    }, opts)).success(success);
  }

  beforeEach(function() {
    fakeTimer = sinon.useFakeTimers();
    fakeServer = sinon.fakeServer.create();

    success = sinon.spy(function(){});
    processor = undefined;

    data = 'OK';
    readData = data;
    cache = new CacheStore();

    fakeServer.respondWith(data);
  });

  afterEach(function() {
    fakeServer.restore();
    fakeTimer.restore();
  });

  describe('constructor', function() {
    it('has default namespace', function() {
      expect(cache.namespace).to.be.equal('mappersmith_cache');
    });

    it('has default ttl', function() {
      expect(cache.ttl).to.be.equal(300);
    });

    it('allows to change the default namespace', function() {
      expect(new CacheStore({namespace: 'A'}).namespace).to.be.equal('A');
    });

    it('allows to change the default ttl', function() {
      expect(new CacheStore({ttl: 5}).ttl).to.be.equal(5);
    });

    it('stores the options object', function() {
      var opts = {a: 1, b: 2};
      expect(new CacheStore(opts).options).to.be.deep.equal(opts);
    })
  });

  describe('#cacheKey', function() {
    var namespace;

    beforeEach(function() {
      namespace = cache.namespace;
    });

    describe('when called with a raw name', function() {
      it('generates a key with the configured namespace', function() {
        expect(cache.cacheKey('A')).to.be.equal(namespace + ':' + 'A');
      });
    });

    describe('when called with a cacheKey', function() {
      it('returns the same value', function() {
        var cacheKey = namespace + ':' + 'A';
        expect(cache.cacheKey(cacheKey)).to.be.equal(cacheKey);
      });
    });
  });

  describe('#isCacheKey', function() {
    it('returns true for cacheKey', function() {
      expect(cache.isCacheKey(cache.cacheKey('A'))).to.be.true;
    });

    it('returns false for everything else', function() {
      expect(cache.isCacheKey('A')).to.be.false;
    });
  });

  describe('#resolveTTL', function() {
    it('returns global TTL if none is defiend', function() {
      expect(cache.resolveTTL()).to.be.equal(cache.ttl);
    });

    it('returns the given TTL when it is valid', function() {
      expect(cache.resolveTTL({ttl: 7})).to.be.equal(7);
    });

    it('returns global TTL when the given one is invalid', function() {
      expect(cache.resolveTTL({ttl: 'wrong'})).to.be.equal(cache.ttl);
    });
  });

  describe('#fetch', function() {
    var request,
        name,
        cacheOpts,
        writeCallback;

    function cacheFetch(gateway, opts) {
      cache.fetch(name, Utils.extend({
        request: request.bind(gateway),
        gatewayInstance: gateway,
        cacheOpts: cacheOpts
      }, opts));

      fakeServer.respond();
      fakeTimer.tick(1);
    }

    beforeEach(function() {
      name = 'some-value';
      cacheOpts = {ttl: 300};
      request = sinon.spy(function(){ this.get() });
      writeCallback = sinon.spy(function(){});

      sinon.stub(cache, 'write');
      sinon.stub(cache, 'read', function(name, callback) { callback(readData) });
    });

    afterEach(function() {
      cache.read.restore();
      cache.write.restore();
    });

    describe('whithout cache', function() {
      beforeEach(function() {
        readData = null;
      });

      describe('with processor', function() {
        var processedData;

        beforeEach(function() {
          processedData = data + 'processed';
          processor = sinon.spy(function(data) { return processedData });
          gateway = newGateway({processor: processor});
          cacheFetch(gateway);
        });

        it('calls the request callback', function() {
          expect(request).to.have.been.called;
        });

        describe('when the request finished with success', function() {
          it('writes the data', function() {
            expect(cache.write).to.have.been.calledWith(name, data, cacheOpts);
          });

          it('uses the assigned processor', function() {
            expect(processor).to.have.been.calledWith(data);
            expect(success).to.have.been.calledWith(processedData);
          });
        });
      });

      describe('without processor', function() {
        beforeEach(function() {
          gateway = newGateway();
          sinon.spy(gateway, 'success');
          cacheFetch(gateway);
        });

        it('reassigns the success callback', function() {
          expect(gateway.success).to.have.been.called;
        });

        it('calls the request callback', function() {
          expect(request).to.have.been.called;
        });

        describe('when the request finished with success', function() {
          it('writes the data', function() {
            expect(cache.write).to.have.been.calledWith(name, data, cacheOpts);
          });
        });
      });
    });

    describe('with cache', function() {
      beforeEach(function() {
        cacheFetch(newGateway());
      });

      it('does not call the request callback', function() {
        expect(request).to.not.been.called;
      });

      it('calls the successCallback with data', function() {
        expect(success).to.have.been.calledWith(data);
      });
    });
  });

  ['read', 'write', 'delete', 'cleanup', 'clear'].forEach(function(method) {
    describe('#' + method, function() {
      beforeEach(function() {
        if (cache[method].restore) {
          cache[method].restore();
        }
      });

      it('throws Mappersmith.Utils.Exception with NotImplemented message', function() {
        expect(function() { cache[method]() }).to.throw(Utils.Exception, /not implemented/);
      });
    });
  });

});
