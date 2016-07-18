'use strict';
require('../nconf');
require('../mongoose');
const request = require('request');
const expect = require('chai').expect;
const url = require('url');

const baseUrl = 'http://127.0.0.1:3000';
var emojiService = require('../services/wechat/emoji-service');

var mongoose = require('mongoose');
var Device = mongoose.model('Device');
var Emoji = mongoose.model('Emoji');
var GroupModel = mongoose.model('Group');
var CustomerAccount = mongoose.model('CustomerAccount');

var emojiData = require('./deviceData/emoji-data');

//插入测试数据

//插入设备
let deviceList = emojiData.deviceList;
deviceList.forEach(function(item, index){
    let entity =new Device(item);
    entity.save();
});

//插入用户
let customerAccount = emojiData.customerAccount;
new CustomerAccount(customerAccount).save();

//插入群
let group = emojiData.group;
new GroupModel(group).save();

describe('微信表情包', () => {
    it('获取表情包列表', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/wechat/emoji"),
            json: true
        };

        request.get(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.a('Array');
            done();
        });
    });

    it('点播表情', done => {
        let option = {
            url: url.resolve(baseUrl, "/api//wechat/emoji/dibble"),
            body: {
                voiceFileName:'悲剧声效.gif'
            },
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body.code).to.be.equal(200);
            done();
        });
    });
});