/**
 * Created by JiamingLinn on 16-7-7.
 */
'use strict';
const Common = require('./common');
const async = require('async');
const interfaces = require('./interface-list');

class Ximalaya extends Common{

  constructor(opts, getToken, saveToken) {
    super(opts, getToken, saveToken);

    const that = this;
    for(let interfaceName in interfaces) {
      this[interfaceName] = function(params, cb) {
        if (typeof params === 'function') {
          cb = params;
          params = {};
        }
        let tasks = [
          async.apply(that.authorize.bind(that), params),
          that.autoDeviceId.bind(that),
          async.asyncify(that.sign.bind(that))
        ];
        return async.waterfall(tasks, (err, params) => {
          let path = interfaces[interfaceName];
          console.log(path, params, cb);
          that.sendRequest(path, params, cb);
        });
      };
    }
  }
}

module.exports = Ximalaya;
