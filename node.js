var Utils = require('mappersmith').Utils;
module.exports = Utils.extend(require('./'), {
  node: {

    NodeRedisCacheStore: require('./src/node-redis-cache-store')

  }
});
