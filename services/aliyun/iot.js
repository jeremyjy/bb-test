'use strict';

const IOT = require('waliyun').IOT;

const sendRequest = require('waliyun/dist/common').sendRequest;
const BASE = require('waliyun/dist/common').BASE;

const conf = require('./aliyun-config');
let iotConf = conf.iot;
Object.assign(iotConf, conf);

/**
 * IOTshime
 */
IOT.prototype.RegistDevice = function (opts, method) {
  this.params = Object.assign({Action: 'RegistDevice'}, BASE.options, opts);
  this.params.SignatureNonce = Math.random();
  this.params.Timestamp = new Date().toISOString();
  const API = 'https://iot.aliyuncs.com/';
  return sendRequest(API, this.params, BASE.secret, method);
};

const iot = new IOT(iotConf);

var api = {

  /**
   *发布信息到指定 topic
   * @param opts
   *  * MessageContent  {String}  发送的消息，将消息内容二进制进行BASE64转码后得到的字符串
   *  * MacAddress  {String}  物理地址
   * @param cb
   *  - err
   *  - result {failObj|succesObj}
   * @returns {Promise|*}
   *  成功时传入：
   *  - successObj
   *    - RequestId {String}
   *    - success {Boolean} 是否发送成功;如果发送失败时
   *  失败时传入：
   *  - failObj
   *    - RequestId {String}
   *    - Message {String} 失败返回信息，成功时
   *    - HostId {String} 失败时请求的域名，成功时
   *    - Code {String} 错误码，成功时
   */
  pub: wrap('pub'),

  /**
   * 设备授权
   *
   * @param opts
   *  * DeviceId  {String}  设备的标识ID
   *  * GrantType  {String}  PUB,SUB,ALL
   *  * MacAddress  {String}  物理地址
   * @param cb
   * @returns {Promise}
   *  成功时传入：
   *  - successObj
   *    - RequestId {String}
   *    - success {Boolean} 是否发送成功;如果发送失败时
   *  失败时传入：
   *  - failObj
   *    - RequestId {String}
   *    - Message {String} 失败返回信息，成功时
   *    - HostId {String} 失败时请求的域名，成功时
   *    - Code {String} 错误码，成功时
   *    - errorMessage
   */
  deviceGrant: wrap('DeviceGrant'),

  /**
   * 设备注册
   *
   * @param opts
   *  * DeviceName  {String}  可选的，自定义设备名称，不传则由系统生成默认与deviceId一致
   * @param cb
   * @returns {Promise}
   *  成功时传入：
   *  - successObj
   *    - RequestId {String}
   *    - success {Boolean} 是否发送成功;如果发送失败时
   *  失败时传入：
   *  - failObj
   *    - RequestId {String}
   *    - Message {String} 失败返回信息，成功时
   *    - HostId {String} 失败时请求的域名，成功时
   *    - Code {String} 错误码，成功时
   *    - errorMessage
   */
  registDevice: wrap('RegistDevice', conf.iot20160530.Version)
};

module.exports = api;

function wrap(method, version) {
  return function (opts, cb) {
    if (version === conf.iot20160530.Version) {
      Object.assign(opts, conf.iot20160530);
    }

    // 处理物理地址问题
    if (opts.MacAddress) {
      let appkey = iotConf.AppKey;
      let topicName = appkey + '/devices/' + opts.MacAddress;
      delete opts.MacAddress;
      opts.TopicFullName = topicName;
    }

    // 发送内容序列化
    if (opts.MessageContent && typeof opts.MessageContent !== 'string') {
      opts.MessageContent = new Buffer(JSON.stringify(opts.MessageContent)).toString('base64');
    }

    if (!cb) {
      return iot[method](opts);
    }
    try {
      iot[method](opts).then(resObj => {
        return cb(null, resObj);
      });
    } catch (e) {
      cb(e);
    }
  }
}

