'use strict'
var oss = require('../aliyun/story-oss');
var CustomerAccount = require('mongoose').model('CustomerAccount');
var mongoose = require('mongoose');
var Device = mongoose.model('Device');
var Story = mongoose.model('Story');
var StoryOperationHistory = mongoose.model('StoryOperationHistory');
var Promise = require('bluebird');
var iot = require('./../aliyun/iot');
var debug = require('debug')('bbCloud:story');
var nconf = require('nconf');
var request = require('request');
var WechatAPI = require('wechat-api');
var wechatApi = new WechatAPI(nconf.get('wechat:appId'), nconf.get('wechat:appSecret'));

let storyService = {};

storyService.getTestToken = function (req, res, next) {

}

storyService.pushStory = function (req, res, next) {
  var storyId = req.body.story;
  if (!storyId) {
    return next({code: 400, msg: 'storyId is required'})
  }
  new Promise(function (resolve, reject) {
    CustomerAccount.findOne({"_id": req.user.sub}).populate({
      path: 'deviceId',
      select: 'macAddress'
    }).then(function(account){
      // if (!account.deviceId) {
      //   reject({code: 400, msg: 'did not has a device'})
      // }else if(!account.deviceId.macAddress){
      //   reject({code: 400, msg: 'dit not bind macAddress'})
      // }else {
      //   resolve(account)
      // }
      resolve(account)
    })
  }).then(function (account) {
    return new Promise(function (resolve, reject) {
      // 获取故事
      Story.findById({_id:storyId}).then(function (story){
        if(!story) {
          reject({code: 400, msg: 'story not found'});
        }
        resolve({story,account});
      })
    })
  }).then(function (data) {
    let story = data.story;
    let account = data.account;
    let serverIds = req.body.serverIds;
    if (!serverIds) {
      return Promise.resolve({story,account,yinzi:'',question:''});
    }
    return new Promise(function (resolve, reject) {
      if (serverIds.yinzi) {
        let filename = req.user.sub + '-' + story._id + '-yinzi.amr';
        SaveVoiceToOSS(serverIds.yinzi,filename,function (err,res) {
          if(err) {
            return next(err)
          }
          console.log('已保存到阿里OSS');
          let yinzi = res.url;
          resolve({story,account,yinzi})
        });
      }else{
        resolve({story,account,yinzi:''})
      }
    }).then(function (data) {
      return new Promise(function (resolve, reject) {
        if (serverIds.question) {
          let filename = req.user.sub + '-' + story._id + '-question.amr';
          SaveVoiceToOSS(serverIds.question,filename,function (err,res) {
            if(err) {
              return next(err)
            }
            console.log('已保存到阿里OSS');
            let question = res.url;
            let yinzi = data.yinzi;
            resolve({story,account,yinzi,question})
          });
        }else{
          resolve({story,account,yinzi:'',question:''})
        }
      })
    })
  }).then(function (data) {
    let account = data.account;
    console.log('req.body:',req.body);
    //查找设备
    return new Promise(function (resolve,reject) {
      // 创建操作记录
      let operation = {
        story: storyId,
        operatedBy: req.user.sub,
        sendTo: account.deviceId,
        opType: (req.body.action == 'download' ? 3 : 2),
        introduction: data.yinzi || '',
        questions: data.question || ''
      }
      // save record
      new StoryOperationHistory(operation).save().then(function (operationModel) {
        // let macId = account.deviceId.macAddress;
        let macAddress = '00:01:6C:06:A6:29';
        resolve({operationModel, data, macAddress});
      })
    })
  }).then(function (result) {
    // 推送到阿里云
    var intent = req.body.action == 'download' ? 'downloadStory' : 'playStory';
    var messageContent = {
      deviceTopic: "action/BBCloud",
      payload: {
        intent: intent,
        bucket: 'story',
        introductionFile: result.data.yinzi,
        storyFile: result.data.story.fileName,
        questionsFile: result.data.question
      }
    };
    if (intent === 'downloadStory') {
      messageContent.payload.storyType = 'bbcloud';
      messageContent.payload.nonce = operationModel._id;
    }
    //推送
    iot.pub({MacAddress: result.macAddress, MessageContent: messageContent}, function(err, result){
        if(err) {
          return next({code: 400, msg: err})
        }
        console.log('iot result:' , result);
    });
    res.json({code:200, msg:'ok'});
  }).catch(function (err) {
    return next({code:400,msg:err})
  })
}

function SaveVoiceToOSS(wxMid,ossid,cb) {
  return wechatApi.getMediaStream(wxMid, (err, res) => {
    if (err) {
      cb(err);
    }
    oss.putStream(ossid, res, (err, res) => {
      cb(err, res);
    });
  });
}

module.exports = storyService;
