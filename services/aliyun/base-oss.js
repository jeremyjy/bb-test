'use strict';

const OSS = require('ali-oss');
const co = require('co');

const conf = require('./aliyun-config');

const slice = [].slice;

function wrap(oss, method) {
  return function() {
    let args = slice.apply(arguments);

    let fn = oss[method];

    let cb = args[args.length - 1];
    if (cb instanceof Function && !(cb instanceof Array)) { // if has callback
      return co(function * () {
        cb = args.pop();
        try {
          let obj = yield fn.apply(oss, args);
          return cb(null, obj);
        } catch (e) {
          return cb(e);
        }
      });
    } else {
      return co(function * () {
        return yield fn.apply(oss, args);
      });
    }
  }
}

let apiList = [
  /**
   *获取存储对象的流
   *
   * @param filename {String} 对象名
   * @param cb
   *  - resObj
   *    - stream {IncomingMessage}
   *    - res
   *      - status {Number}
   *      - headers {Object}
   */
  'getStream',

  /**
   * 把流发送到oss
   *
   * @param name {String}
   * @param stream {ReadableStream}
   * @param cb
   *  - err
   *  - resObj
   */
  'putStream',
  'put',
  'list',
  'deleteMulti'

];

module.exports = function(bucket) {
  let ossConf = conf.oss;

  Object.assign(ossConf, {bucket}, {accessKeyId: conf.AccessKeyId, accessKeySecret: conf.AccessKeySecret});
  let oss = new OSS(ossConf);

  let api = {};

  apiList.forEach(method => {
    api[method] = wrap(oss, method);
  });

  return api;
};
