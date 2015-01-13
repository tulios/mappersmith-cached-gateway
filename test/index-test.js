var expect = chai.expect;
var Mappersmith = require('mappersmith');

describe('MappersmithCachedGateway', function() {

  // it('works', function() {
  //   var fakeTimer = sinon.useFakeTimers();
  //   var fakeServer = sinon.fakeServer.create();
  //
  //   var Gateway = MappersmithCachedGateway(Mappersmith.VanillaGateway);
  //   var Client = Mappersmith.forge({
  //     host: 'http://full-url',
  //     resources: {
  //       Test: {execute: {path: '/path'}}
  //     }
  //   }, Gateway);
  //
  //   fakeServer.respondWith(
  //     'GET',
  //     'http://full-url/path',
  //     [200, {'Content-Type': 'text/plain'}, 'OK']
  //   );
  //
  //   var success = sinon.spy(function(){});
  //
  //   Client.Test.execute(success).fail(function() { console.log(arguments) });
  //   fakeTimer.tick(1);
  //
  //   fakeServer.respond();
  //   fakeTimer.tick(1);
  //
  //   expect(success).to.have.been.calledWith('OK');
  //   expect(fakeServer.requests.length).to.equal(1);
  //
  //   fakeServer.restore();
  //   fakeTimer.restore();
  // });

});
