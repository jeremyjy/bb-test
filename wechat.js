var nconf = require('nconf');
var Promise = require('bluebird');
var AccessToken = Promise.promisifyAll(require('./models/accesstoken'));
var WeChatAPI = require('wechat-api');
var WeChatOath = require('wechat-oauth');
var wechatAPI = new WeChatAPI(nconf.get('wechat:appId'), nconf.get('wechat:appSecret'), function (cb) {
    AccessToken.findOne({type: 'wechat'}).then(function (result) {
        if (!result) {
            return cb()
        }
        console.log('read token from mongoose:' + result.token)
        cb(null, result.token);
    }).catch(function (err) {
        cb(err);
    })
}, function (token, cb) {
    console.log('createToken:' + token)
    AccessToken.update({type: 'wechat'}, {token: token, updateAt: new Date()}, {upsert: true}).then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        cb(err);
    })
});
var wechatOauth = new WeChatOath(nconf.get('wechat:appId'), nconf.get('wechat:appSecret'), function (cb) {
    AccessToken.findOne({type: 'wechat'}).then(function (result) {
        console.log('read token from mongoose:' + result.token)
        cb(null, result.token);
    }).catch(function (err) {
        cb(err);
    })
}, function (token, cb) {
    console.log('createToken:' + token)
    AccessToken.update({type: 'wechat'}, {token: token, updateAt: new Date()}, {upsert: true}).then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        cb(err);
    })
});
exports.wechatAPI = wechatAPI;
exports.wechatOauth = wechatOauth;
