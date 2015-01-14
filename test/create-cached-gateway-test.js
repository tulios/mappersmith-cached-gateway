var expect = chai.expect;
var Utils = Mappersmith.Utils;

var createCachedGateway = MappersmithCachedGateway.createCachedGateway;

describe('#createCachedGateway', function() {
  var TransportGateway,
      CachedGateway;

  beforeEach(function() {
    TransportGateway = Mappersmith.VanillaGateway;
  });

  it('creates a new class that inherits from the configured gateway', function() {
    CachedGateway = createCachedGateway(
      TransportGateway,
      MappersmithCachedGateway.CacheStore
    );

    Object.getOwnPropertyNames(TransportGateway.prototype).
    filter(function(property) { return property !== 'get' }).
    forEach(function(property) {
      expect(CachedGateway.prototype).to.have.property(
        property,
        TransportGateway.prototype[property]
      );
    });
  });

  describe('with cacheStore options', function() {
    var StubbedStore,
        opts;

    beforeEach(function() {
      opts = {ttl: 1};
      StubbedStore = sinon.spy(MappersmithCachedGateway, 'LocalStorageCacheStore');
      createCachedGateway.__set__('LocalStorageCacheStore', StubbedStore);
    });

    afterEach(function() {
      MappersmithCachedGateway.LocalStorageCacheStore.restore();
    });

    it('accepts as the first argument', function() {
      createCachedGateway(opts);
      expect(StubbedStore).to.have.been.calledWith(opts);
    });

    it('accepts as the second argument', function() {
      createCachedGateway(Mappersmith.VanillaGateway, opts);
      expect(StubbedStore).to.have.been.calledWith(opts);
    });

    it('accepts as the third argument', function() {
      createCachedGateway(
        Mappersmith.VanillaGateway,
        Mappersmith.LocalStorageCacheStore,
        opts
      );
      expect(StubbedStore).to.have.been.calledWith(opts);
    });
  });

  describe('#get', function() {
    var cache,
        StubbedStore,
        gateway,
        url,
        cacheOpts;

    beforeEach(function() {
      sinon.spy(TransportGateway.prototype, 'get');

      cache = new MappersmithCachedGateway.CacheStore();
      StubbedStore = sinon.stub(MappersmithCachedGateway, 'CacheStore');
      StubbedStore.returns(cache);

      sinon.spy(cache, 'fetch');
      sinon.stub(cache, 'write');
      sinon.stub(cache, 'read', function(name, callback) { callback() });

      CachedGateway = createCachedGateway(
        Mappersmith.VanillaGateway,
        StubbedStore
      );

      url = 'http://full-url';
      cacheOpts = {ttl: 300};

      gateway = new CachedGateway({
        url: url,
        method: 'get',
        opts: {cache: cacheOpts}
      });

      gateway.get();
    });

    afterEach(function() {
      TransportGateway.prototype.get.restore();
      MappersmithCachedGateway.CacheStore.restore();
      cache.fetch.restore();
      cache.write.restore();
      cache.read.restore();
    });

    describe('when calling cacheStore#fetch', function() {
      it('calls with gateway url', function() {
        expect(cache.fetch).to.have.been.calledWith(gateway.url, sinon.match.object);
      });

      it('calls with gateway instance', function() {
        expect(cache.fetch).to.have.been.calledWith(gateway.url, sinon.match({
          gatewayInstance: gateway
        }));
      });

      it('calls with request function pointing to gateway#get', function() {
        var request = cache.fetch.lastCall.args[1].request;
        expect(request).to.be.a('function');
        request();
        expect(TransportGateway.prototype.get).to.have.been.called;
      });

      it('calls with cacheOpts', function() {
        expect(cache.fetch).to.have.been.calledWith(gateway.url, sinon.match({
          cacheOpts: cacheOpts
        }));
      });
    });
  });

});
