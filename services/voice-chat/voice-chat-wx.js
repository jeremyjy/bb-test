'use strict';

const Uuid = require('node-uuid');
const async = require('async');
const mime = require('mime');
mime.define({'audio/amr': ['amr']});

const wxapi = require('./wechat-api-shim');
const oss = require('../aliyun/voice-chat-oss');
const Group = require('../../models/group');
const CustomerAccount = require('../../models/customer-account');

class VoiceCloudWechat {

  /**
   * 处理获取语音
   *
   * @override
   * @param wxObj {Object} wx返回的结果对象
   *  * ToUserName	开发者微信号
   *  * FromUserName	发送方帐号（一个OpenID）
   *  * CreateTime	消息创建时间 （整型）
   *  * MsgType	视频为video
   *  * MediaId	视频消息媒体id，可以调用多媒体文件下载接口拉取数据。
   *  * ThumbMediaId	视频消息缩略图的媒体id，可以调用多媒体文件下载接口拉取数据。
   *  * MsgId	消息id，64位整型
   * @param cb
   *  - err {Error}
   *  - result
   *    - fromUser {CustomerAccount}
   *    - group {Group}
   *    - mid {String}
   *    - weixin {Object}
   *      - MediaId {String}
   */
  receiveVoice(wxObj, cb) {
    //todo 还要标准化 error 信息
    let that = this;

    cb = cb || function() {};

    if (!wxObj.FromUserName || !wxObj.MediaId) {
      let error = new Error('error getting message from weixin:', wxObj);
      return cb(error);
    }

    let tasks = {};

    tasks.fromUser = (msgObj, cb) => {
      return that.getUser({wechatOpenId: wxObj.FromUserName}, (err, fromUser) => {
        if (!fromUser) return cb(new Error('no such user account from weixin:' + wxObj.FromUserName));
        return cb(err, Object.assign(msgObj, {fromUser}));
      });
    };

    tasks.mid = (msgObj, cb) => {
      return that._saveVoiceToOSS(wxObj.MediaId, (err, mid) => {
        if (!mid) return cb(new Error('save voice fail'));
        return cb(err, Object.assign(msgObj, {mid}));
      });
    };

    tasks.group = (msgObj, cb) => {
      return that.getGroup(msgObj, (err, group) => {
        if (!group) return cb(new Error('no such group: ' + msgObj));
        return cb(err, Object.assign(msgObj, {group}));
      });
    };
    async.waterfall([
      async.apply(tasks.fromUser, {weixin: wxObj}),
      tasks.mid,
      tasks.group
    ], cb);
  }

  /**
   * 将wx服务器的语音保留
   * @param wxMid
   * @param cb
   *  - err {Error}
   *  - ossid {String} 保存在oss的对象名
   * @private
   */
  _saveVoiceToOSS(wxMid, cb) {
    //todo pipe media from wxserver to oss, and log to mongodb
    return wxapi.getMediaStream(wxMid, (err, res) => {
      if (err) {
        cb(err);
      }
      let headers = res.headers;
      //let ext = mime.extension(headers['content-type']) || '';
      let size = headers['content-length'] ? Number(headers['content-length']) : null;
      let opts = {
        contentLength: size,
        mime: 'audio/amr'
      };
      let ossid =  Uuid.v1() + '.amr';

      oss.putStream(ossid, res, (err, res) => {
        /**
         { res:
           { status: 200,
             statusCode: 200,
             headers:
              { server: 'AliyunOSS',
                date: 'Tue, 21 Jun 2016 07:10:25 GMT',
                'content-type': 'application/octet-stream',
                'content-length': '23',
                connection: 'keep-alive',
                'x-oss-request-id': '5768E861D8EB8323110511A6',
                'x-oss-bucket-storage-type': 'standard',
                'accept-ranges': 'bytes',
                etag: '"26C544498DD0E23101933D1E085EEED1"',
                'last-modified': 'Mon, 20 Jun 2016 06:30:58 GMT',
                'x-oss-object-type': 'Normal',
                'x-oss-server-time': '49' },
             size: 23,
             aborted: false,
             rt: 191,
             keepAliveSocket: false,
             data: <Buffer 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64>,
             requestUrls: [ 'http://voice-chat.oss-cn-shanghai.aliyuncs.com/test' ] },
          content: <Buffer 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64 64>
          }
         */
        cb(err, ossid);
      });

    });

  }

  /**
   * 获取微信id
   * @param uid
   * @param cb
   *  - err {Error}
   *  - mid
   * @returns {*}
   */
  getClientID(uid, cb) {
    //todo
    cb = cb || function () {};
    return CustomerAccount.findOne({socialAccount: uid}, (err, doc) => {
      return cb(err, doc.wechatOpenId || null);
    });
  }

  /**
   * 发送语音
   * @override
   * @param cObj
   *  * toUser
   *  * mid
   *  * weixin
   *    * MediaId
   * @param cb
   *  - err {Error}
   *  - mediaId
   */
  sendVoice(cObj, cb) {
    let that = this;

    let tasks = {
      openid: async.apply(that.getClientID, cObj.toUser), //微信openid
    };

    if (cObj.weixin && cObj.weixin.MediaId && false) {
      //如果语音已经存在微信服务器，直接使用 media_id
      tasks.mid = (cb) => { //微信语音 media_id
        cb(null, cObj.weixin.MediaId);
      }
    } else {
      //语音不在微信，先上传到微信
      tasks.mid = async.apply(that._pipeMediaOSSToWX, cObj.mid)
    }

    return async.series(tasks, (err, result) => {
      if (err) {
        return cb(err);
      }
      cObj.wexin = {MediaId: result.mid};
      wxapi.sendVoice(result.openid, result.mid, afterSended);
    });

    function afterSended(err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, result.media_id);
    }
  }

  /**
   *
   * @param mid OSS 文件名
   * @param cb
   *  - err {Error}
   *  - mid 微信返回的 media_id
   * @returns {*|Promise}
   * @private
   */
  _pipeMediaOSSToWX(mid, cb) {
    //todo pipe media from oss to wxserver
    return oss.getStream(mid, (err, obj) => {
      if (err) {
        return cb(err);
      }
      let filename = mid;
      let contentType = mime.lookup(filename);
      let fileSize = Number(obj.res.headers['content-length']);

      /*
       {
       type: 'voice',
       media_id: 'DAvlUx83jULrVuos_ekaeGLG3feTILIW2VgNf8Z3q0GQGPWNxBy9yylvNyh37tI2',
       created_at: 1466495337
       }
       */
      wxapi.uploadMediaStream(obj.stream, filename, contentType, fileSize, (err, res) => {
        return cb(err, res.media_id);
      });
    });
  }

  /**
   *
   * @param mid {String} server media id
   * @param group {Group}
   * @param cObj
   */
  broadcast(msgObj, cb) {
    cb = cb || function() {};
    let that = this;
    let members = null;
    let counter = 0;
    let getMidTask;
    let sendMsgsTask;

    if (msgObj.weixin && msgObj.weixin.MediaId) {
      //如果语音已经存在微信服务器，直接使用 media_id
      getMidTask = (cb) => {
        return cb(null, msgObj.weixin.MediaId);
      };
    } else {
      //语音不在微信，先上传到微信
      getMidTask = (cb) => {
        return that._pipeMediaOSSToWX(msgObj.mid, cb);
      };
    }

    sendMsgsTask = (wxmid, cb) => {
      if (msgObj.group && (members = msgObj.group.members)) {
        members.forEach(m => {
          ++counter;
          if (m.socialAccount
            && m.socialAccount.indexOf('1') === 0
            && m.socialAccount !== msgObj.fromUser.socialAccount) {

            console.log( m, msgObj.fromUser.socialAccount);
            return that.getUser({socialAccount: m.socialAccount}, (err, toUser) => {
              if (!toUser) return cb(new Error('no such user: '+ socialAccount));
              wxapi.sendVoice(toUser.wechatOpenId, wxmid, (err, re) => {
                --counter;
                if (counter === 0) return cb(null, re);
              })
            });

          }
        });
      }
    };

    async.waterfall([getMidTask, sendMsgsTask], cb);
  }

  getGroup(msgObj, cb) {
    return Group.findOne({'members.socialAccount': msgObj.fromUser.socialAccount}, cb);
  }

  /**
   * 获取用户
   * @override
   * @param wxID {String} 微信openid
   * @param cb {Function} 回调函数
   *   - error
   *   - msgObj
   */
  getUser(opt, cb) {
    cb = cb || function () {};
    return CustomerAccount.findOne(opt, cb);
  }

}
module.exports = VoiceCloudWechat;
