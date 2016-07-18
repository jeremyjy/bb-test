'use strict';
var logoOss = require('./aliyun/logo-oss');
var emojiOss = require('./aliyun/emoji-oss');
var storyOss = require('./aliyun/emoji-oss');
var fs =require('fs');
var debug = require('debug')('bbCloud:upload');

exports.uploadLogo = function(req, res){
    debug('upload the logo:');
    uploadOss(req, res, logoOss);
};

exports.uploadStory = function(req, res){
    debug('upload the story:');
    uploadOss(req, res, storyOss);
};

function uploadOss(req, res, oss){
    var file = req.files.file;
    oss.putStream(file.name, fs.createReadStream(file.path), function(err, result){
        if(err) {
            throw new Error(err);
        }
        res.json({url: result.url});
    });
}