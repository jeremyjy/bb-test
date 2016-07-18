/**
 * Created by JiamingLinn on 16-7-6.
 */
'use strict';

const crypto = require('crypto');
const request = require('request');
const async = require('async');
const MacAddr = require('getmac');

/**
 * @module public functions
 */

function getSignature(data, secret) {
  let hamc = crypto.createHmac('sha1', secret);
  let md5 = crypto.createHash('md5');
  let joint = Object.keys(data).sort().map( key => {
    return key + '=' + data[key];
  }).join('&');
  let base64 = new Buffer(joint).toString('base64');
  let hmacBytes = hamc.update(base64).digest();
  let md5Bytes = md5.update(hmacBytes).digest();
  return md5Bytes.toString('hex');
}

function wrapperError(err) {
  if (!err) {
    return null;
  }
  err.name = 'XimalayaAPIError';
  err.errno = err.error_no || '000';
  err.errcode = err.error_code;
  err.message = err.error_desc || err.message || 'network error';
  return err;
}

function wrapper(fn) {

  return function (err, result) {
    return fn(wrapper(err), result);
  };

}

/**
 * @class AccessToken
 */
var AccessToken = function (accessToken, expireTime) {
  if (!(this instanceof AccessToken)) {
    return new AccessToken(accessToken, expireTime);
  }
  this.accessToken = accessToken;
  this.expireTime = expireTime;
};

AccessToken.prototype.isValid = function () {
  return !!this.accessToken && (new Date().getTime()) < this.expireTime;
};



class Common {

  /**
   *
   * @param opts
   *  * app_key
   *  * device_id
   *  * client_os_type
   *  * pack_id
   */
  constructor(opts, getToken, saveToken) {
    // this.super();
    //公共参数
    this._options = opts;
    //密钥
    this._secret = opts.app_secret;
    delete this._options.app_secret;

    this._prefix = 'http://api.ximalaya.com';
    this._timeout = 5000;

    this.getToken = getToken || function (callback) {
        callback(null, this.store);
      };
    this.saveToken = saveToken || function (token, callback) {
        this.store = token;
        if (process.env.NODE_ENV === 'production') {
          console.warn('Don\'t save token in memory, when cluster or multi-computer!');
        }
        callback(null);
      };
  }

  /**
   * 自动检测设备id
   *
   * @param params
   * @param cb
   */
  autoDeviceId(params, cb) {
    const that = this;
    if (that._options.device_id) {
      return cb(null, params);
    }

    MacAddr.getMac((err, mac) => {
      if (err) return cb(err);
      that._options.device_id = mac;
      return cb(null, params)
    });
  }

  /**
   * 给参数签名
   * 
   * @param params {Object} 接口请求参数
   * @returns {Object} 签名后的参数
   */
  sign(params) {
    let data = {};
    Object.assign(data, params);
    Object.assign(data, this._options);
    Object.assign(data, {sig: getSignature(data, this._secret)});
    return data;
  }

  /**
   * 给参数加上授权标示，即 access_token
   * 
   * @param params 接口请求参数
   * @param cb
   *  - err {Error}
   *  - params {Object} 被加上授权标志的请求参数
   */
  authorize(params, cb) {
    const that = this;
    params = params || {};

    that.getToken((err, token) => {

      if (err) {
        return cb(err);
      }

      let accessToken;
      let authorizedParams;
      if (token && (accessToken = AccessToken(token.accessToken, token.expireTime)).isValid()) {
        authorizedParams = Object.assign({access_token: token.accessToken}, params);
        return cb(null, authorizedParams);
      } else {
        that.getAccessToken((err, token) => {
          if (err) return cb(err);
          authorizedParams = Object.assign({access_token: token.accessToken}, params);
          return cb(null, authorizedParams);
        })
      }
    });
  }

  getAccessToken(cb) {
    // cb =;
    let that = this;
    let form = {
      client_id: this._options.app_key,
      grant_type: 'client_credentials',
      timestamp: +(new Date()),
      nonce: Math.random()
    };

    let url = this._prefix + '/oauth2/secure_access_token';

    async.waterfall([
      async.constant(form),
      that.autoDeviceId.bind(that),
      async.asyncify(that.sign.bind(that))], (err, form) => {

      if (err) return cb(err);
      request.post({url, form}, posted);

    });

    function posted(err, res) {
      if (err) {
        return cb(err);
      }
      if (!res.body || res.body.access_token) {
        return cb(new Error('res.body is not defined'));
      }

      let data = JSON.parse(res.body);

      if (data.error_no) {
        return cb(new Error(data.error_desc));
      }
      let expireTime = (new Date().getTime()) + (data.expires_in - 60) * 1000;
      let token = AccessToken(data.access_token, expireTime);
      that.saveToken(token, (err) => {
        if (err) {
          return cb(err);
        }
        return cb(null, token);
      });
    }

  }
  
  sendRequest(path, params, method, cb) {
    if (typeof method === 'function') {
      cb = method;
      method = 'get';
    }

    let callback = (err, res) => {
      if (err) return cb(wrapperError(err));
      let data = JSON.parse(res.body);
      if (data.error_no) {
        return cb(wrapperError(data));
      } else {
        return cb(null, data);
      }
    };
    if (method.toLowerCase() === 'get') {
      return request.get(this._prefix + path, callback).qs(params);
    } else if (method.toLowerCase() === 'post') {
      return request.post(this._prefix + path, callback).form(params);
    }
  }
}

module.exports = Common;
