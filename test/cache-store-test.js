var expect = chai.expect;
var Mappersmith = require('mappersmith');
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
    it('has default namespace');
    it('has default ttl');
  });

  describe('#cacheKey', function() {
    it('generates a key with the configured namespace');
  });

  describe('#isCacheKey', function() {
    it('returns true for cacheKey');
    it('returns false for everything else');
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
