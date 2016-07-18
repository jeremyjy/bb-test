require('../nconf');
require('../mongoose');
var oss = require('../services/aliyun/emoji-oss');
var fs = require('fs');
var Emoji = require('mongoose').model('Emoji');

function emojiInitialize(){
    var imgPath = 'resource/emoji/img/';
    var voicePath = 'resource/emoji/voice/';

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
                        }).cache(function(err){
                            throw err;
                        });
                    }
                });
            });
        });
    });
}

function getVoice(name, voices) {
    for(var i = 0; i < voices.length; i++){
        if(name === voices[i].split('.')[0]){
            return voices[i];
        }
    }
}

emojiInitialize();

module.exports = emojiInitialize;
