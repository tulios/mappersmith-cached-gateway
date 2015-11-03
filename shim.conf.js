var conf = {};

if (process.env.NODE_ENV !== 'test') {
  conf = {
    'mappersmith': { exports: 'global:Mappersmith' }
  }
}

module.exports = conf;
