'use strict';

const oss = require('../aliyun/voice-chat-oss');
const iot = require('../aliyun/iot');
const Group = require('../../models/group');
const Device = require('../../models/device');

const uuid = require('node-uuid');
const async = require('async');

class VoiceChatIOT {

  /**
   *
   * @param mess {Object} received message,
   *    see http://redmine.nane.cn/redmine/projects/smarttoys_cloud/wiki/Send_Message_between_Device_and_Device
   *    also http://redmine.nane.cn/redmine/projects/smarttoys_cloud/wiki/Chat_between_Wechat_Client_and_Device
   * @param cb
   *  - err {Error}
   *  - msgObj
   *    - fromUser {CustomerAccount|Device}
   *    - mid {String} filename saved in oss
   *    - group {Group}
   *    - to {CustomerAccount|Device}
   */
  receiveVoice(mess, cb) {
    let that = this;
    let tasks = {
      mid: async.apply(that._saveVoiceToOSS, mess.data),
      fromUser: async.apply(that.getUser, {socialAccount: mess.from}),
    };

    if (mess.groupId) {
      tasks.group = async.apply(that.getGroup, mess);
    }

    if (mess.to) {
      tasks.toUser = async.apply(that.getUser, {socialAccount: mess.to});
    }

    return async.series(tasks, cb);
  }

  _saveVoiceToOSS(content, cb) {
    let ossid =  uuid.v1() + '.amr';
    return oss.put(ossid, new Buffer(content, 'base64'), (err, res) => {
      cb(err, res.name)
    });
  }

  broadcast(msgObj, cb) {
    let that = this;
    let members;
    let counter = 0;
    let results = [];
    if (msgObj.group && (members = msgObj.group.members)) {
      members.forEach((m, ind) => {

        if (m.socialAccount[0] != '0'
          || m.socialAccount == msgObj.fromUser.socialAccount) {
          return ;
        }

        let contentMsg = {
          "deviceTopic": "语聊处理器",
          "payload": {
            "type": "group",
            "groupId": msgObj.group._id,
            "from": msgObj.fromUser.socialAccount,
            "data": {
              bucket:'voice-chat',
              fileName: msgObj.mid
            }
          }
        };
        return async.waterfall([async.apply(that.getUser, {socialAccount: m.socialAccount}), sendMsgTask], cb);

      });
    }

    function sendMsgTask(toUser, cb) {
      let msg = {
        "deviceTopic": "语聊处理器",
        "payload": {
          "type": "group",
          "groupId": msgObj.group._id,
          "from": msgObj.fromUser.socialAccount,
          "data": {
            bucket:'voice-chat',
            fileName: msgObj.mid
          }
        }
      };
      return iot.pub({MacAddress: toUser.macAddress, MessageContent: msg}, cb);
    }
  }

  sendVoice(msgObj, cb) {
    let message = {
      deviceTopic: "语聊处理器",
      payload: {
        type: "single",
        from: msgObj.fromUser.socialAccount,
        to: msgObj.toUser.socialAccount,
        data: {
          bucket:'voice-chat',
          fileName: msgObj.mid
        }
      }
    };
    iot.pub({
      MessageContent: message,
      MacAddress: msgObj.toUser.macAddress
    }, cb);
  }

  getGroup(mess, cb) {
    return Group.findById(mess.groupId, cb);
  }

  getUser(opt, cb) {
    return Device.findOne(opt, cb);
  }

}

module.exports = VoiceChatIOT;
