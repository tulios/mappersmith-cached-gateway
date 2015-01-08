var expect = chai.expect;
var Mappersmith = require('mappersmith');

describe('MappersmithCachedGateway', function() {
  var fakeServer,
      host,
      path,
      url,
      method,
      rawData,
      success,
      fail,
      complete;

  beforeEach(function() {
    fakeServer = sinon.fakeServer.create();
    fakeServer.lastRequest = function() {
      return fakeServer.requests[fakeServer.requests.length - 1];
    }

    host = 'http://full-url';
    path = '/path';
    url = host + path;
    success = sinon.spy(function(){});
    fail = sinon.spy(function(){});
    complete = sinon.spy(function(){});
  });

  afterEach(function() {
    fakeServer.restore();
  });

  it('works', function() {
    method = 'get';
    rawData = 'OK';

    fakeServer.respondWith(
      method,
      url,
      [status, {'Content-Type': 'text/plain'}, rawData]
    );

    var Gateway = MappersmithCachedGateway(Mappersmith.VanillaGateway);
    var Client = Mappersmith.forge({
      host: host,
      resources: {
        Test: {execute: 'get:' + path}
      }
    }, Gateway);

    Client.Test.execute(success);

    fakeServer.respond();
    expect(success).to.have.been.calledWith('OK');
    expect(fakeServer.requests.length).to.equal(1);
  });

});
