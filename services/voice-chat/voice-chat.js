'use strict';

const wx = require('./voice-chat-wx');
const iot = require('./voice-chat-iot');
const GroupChatHistory = require('../../models/group-chat-history');

const async = require('async');

class VoiceChat {

  constructor() {
    this._proxy = {};
    this._receiver = null;
  }

  use(proxyName, proxy) {
    this._proxy[proxyName] = proxy;
    return this;
  }

  setReceiver(proxyName) {
    if (!(proxyName in this._proxy)) {
      throw new Error(`unsurport proxy: ${proxyName}`);
    }
    this._receiver = this._proxy[proxyName];
    return this;
  }

  listenGroup(msg, cb) {
    return async.waterfall([async.apply(this.receiveVoice.bind(this), msg), this.broadcast.bind(this)], cb);
  }

  listenSingle(msg, cb) {
    return async.waterfall([async.apply(this.receiveVoice.bind(this), msg), this.sendVoice.bind(this)], cb);
  }

  receiveVoice(msg, cb) {
    return this._receiver.receiveVoice(msg, cb);
  }

  broadcast(msgObj, cb) {
    let that = this;
    async.series([
      recordHistory,
      broadcastAll
    ], (err, result)=>{
      return cb(err, result);
    });

    function recordHistory(cb) {
      if (!msgObj.group) {
        return cb(new Error('no such group'))
      }
      let record = new GroupChatHistory({
        groupId: msgObj.group.groupId,
        from: {
          socialAccount: msgObj.fromUser.socialAccount,
          nickName: msgObj.fromUser.socialAccount
        },
        content: msgObj.mid
      });
      return record.save(cb);
    }
    function broadcastAll(cb) {
      for(let proxyName in that._proxy) {
        let proxy = that._proxy[proxyName];
        proxy.broadcast(msgObj, cb);
      }
    }
  }

  sendVoice(msgObj, cb) {
    return this._receiver.sendVoice(msgObj, cb);
  }

}

let voiceChat = new VoiceChat()
  .use('wx', new wx())
  .use('iot', new iot());
module.exports = voiceChat;
