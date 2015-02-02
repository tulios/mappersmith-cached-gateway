require('./test-helper');
var MappersmithCachedGateway = require('../../node');

describe('MappersmithCachedGateway', function() {
  describe('attribute "node"', function() {

    it('exposes NodeRedisCacheStore', function() {
      expect(MappersmithCachedGateway.node.NodeRedisCacheStore).to.exist();
    });

  });
});
