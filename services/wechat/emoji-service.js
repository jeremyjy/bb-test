var oss = require('../aliyun/emoji-oss');
var fs = require('fs');
var Emoji = require('mongoose').model('Emoji');
var GroupModel = require('mongoose').model('Group');
var CustomerAccount = require('mongoose').model('CustomerAccount');
var Device = require('mongoose').model('Device');
var Promise = require('bluebird');
var iot = require('./../aliyun/iot');
var debug = require('debug')('bbCloud:emoji');

exports.getEmoji = function(req, res){
    debug('get the emoji list :');
    Emoji.find({}).then(function(emojis){
        res.json(emojis);
    });
};

exports.emojiDibble = function(req, res){
    var emoji = req.body;
    var messageContent = {
        deviceTopic: 'action/BBCloud',
        payload: {
            intent: 'playEmoji',
            emojiName: emoji.voiceFileName
        }
    };
    //TODO 暂时固定
    var openId = 'oza3XwWY50x-6r-qW0DAcIqmtuQA';

    Promise.resolve().then(function(){
        return CustomerAccount.findOne({"wechatOpenId": openId}).then(function(customerAccount){
            if(!customerAccount) throw {code: 400, msg: 'customerAccount not found'};
            return customerAccount;
        })
    }).then(function(data){
        var deviceList =[];
        return GroupModel.findOne({"members.socialAccount": data.socialAccount}).then(function(groupModel){
            if(!groupModel) throw {code: 400, msg: 'group not found'};
            groupModel.members.forEach(function(item, index){
                if(item.socialAccount.substring(0,1) === '0'){
                    deviceList.push(item.socialAccount);
                }
            });
            return deviceList;
        });
    }).then(function(data){
        debug('iot pub topic to playEmoji: ');
        data.forEach(function(item, index){
            Device.findOne({"socialAccount": item}).then(function(device){
                iot.pub({MacAddress: device.macAddress, MessageContent: messageContent}, function(err, result){
                    if(err) debug.error(err);
                    debug('iot result:' , result);
                });
            })
        });
        res.json({code: 200});
    }).catch(function(err){
        debug('emoji dibble err:', err);
        res.json(err);
    });
};

var imgPath = 'resource/emoji/img/';
var voicePath = 'resource/emoji/voice/';

fs.exists(imgPath, function(img){
    if(img){
        fs.exists(imgPath, function(voice){
            if(voice){
                emojiInitialize();
            }
        })
    }
});

function emojiInitialize() {
    debug('Initialize the emoji');
    fs.readdir(imgPath, function(err, images){
        fs.readdir(voicePath, function(err, voices){
            images.forEach(function(iconFileName, index){
                var name  = iconFileName.split('.')[0];
                Emoji.findOne({"name": name}).then(function(emoji){
                    if(!emoji){
                        var voiceFileName = getVoice(name, voices);

                        Promise.resolve().then(function(){
                            //上传图片,返回URL
                            return oss.putStream(iconFileName, fs.createReadStream(imgPath + iconFileName), function(err, result){
                                if(err) {
                                    throw new Error(err);
                                }
                                return result.url;
                            });
                        }).then(function(iconUrl){
                            //上传音频,返回URL
                            return oss.putStream(voiceFileName, fs.createReadStream(voicePath + voiceFileName), function(err, result){
                                if(err) {
                                    throw new Error(err);
                                }
                                return {iconUrl: iconUrl, voiceUrl: result.url};
                            });
                        }).then(function(url){
                            //存入数据库
                            var eitity = {
                                name: name,
                                iconFileName: iconFileName,
                                voiceFileName: voiceFileName,
                                iconFileUrl: url.iconUrl,
                                voiceFileUrl: url.voiceUrl
                            };
                            Emoji(eitity).save();
                        }).catch(function(err){
                            throw err;
                        });
                    }
                });
            });
        });
    });
}

exports.initialize = emojiInitialize;

function getVoice(name, voices) {
    for(var i = 0; i < voices.length; i++){
        if(name === voices[i].split('.')[0]){
            return voices[i];
        }
    }
}
