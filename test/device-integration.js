'use strict';
require('../nconf');
require('../mongoose');
const request = require('request');
const expect = require('chai').expect;
const url = require('url');
const _ = require('lodash');

const baseUrl = 'http://127.0.0.1:3000';

var mongoose = require('mongoose');
var Device = mongoose.model('Device');
var DeviceAppConfiguration = mongoose.model('DeviceAppConfiguration');

//插入设备
let device = {
    macAddress: 'MacId001',
    bbcloudDeviceId: 'bbcloudDeviceId-test-123',
    aliyunDeviceId: 'aliyunDeviceId-test-123',
    aliyunDeviceSecret: 'aliyunDeviceSecret-test-123',
    wechatDeviceId: 'wechatDeviceId-test-123'
};

let entity = new Device(device);

entity.save();

//插入设备APP配置
let deviceAC = {
    v : 1,
    key: 'test',
    value: 'test',
    macAddress: '80:32:25:f6'
};

let entityAC = new DeviceAppConfiguration(deviceAC);

entityAC.save();

describe('设备激活', () => {
    it('健康检查', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/health-check"),
            json: true
        };

        request.get(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body.msg).to.be.equal('ok');
            done();
        });
    });

    it('交换信息失败', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/exchange-id"),
            body: {
                macAddress: '00:88:65:39:8d:91',
                nonce: '123'
            },
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body.code).to.be.equal(400);
            expect(body.msg).to.be.equal('devices not found');
            done();
        });
    });

    it('交换信息成功', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/exchange-id"),
            body: {
                macAddress: 'MacId001',
                nonce: '123'
            },
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(_.has(body, 'bbcloudDeviceId')).to.be.true;
            done();
        });
    });

    it('上报激活事件失败', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/analytics"),
            body:{
                "eventId": 'eventId001',
                "event": 'device-activated',
                "data": {
                    "macAddress": "00:88:65:39:8d:92",
                    "activatedAt": "1464947524"
                }
            },
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body.code).to.be.equal(500);
            expect(body.msg).to.be.equal('request fail');
            done();
        });
    });

    it('上报激活事件成功', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/analytics"),
            body:[
                {
                    "eventId": 'eventId001',
                    "event": 'device-activated',
                    "data": {
                        "macAddress": "MacId001",
                        "activatedAt": "1464947524"
                    }
                },
                {
                    "eventId": 'eventId002',
                    "event": 'device-activated',
                    "data": {
                        "macAddress": "40:8d:5c:a9:1a:f5",
                        "activatedAt": "1465325151"
                    }
                }
            ],
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.a('Array');
            expect(body[0]).to.be.equal('eventId001');
            done();
        });
    });

    it('更改数据库设备激活时间', done => {
        Device.findOne({macAddress: device.macAddress}).then(function(device){
            expect(device.activatedAt).to.be.a('Date');
            done()
        });
    });
});

describe('设备APP配置', () => {
    it('获取最新配置项失败', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/"+deviceAC.macAddress+"/configuration"),
            json: true
        };

        request.get(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body.code).to.be.equal(500);
            expect(body.msg).to.be.equal('request fail');
            done();
        });
    });

    it('获取最新配置项成功', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/"+deviceAC.macAddress+"/configuration?key=test"),
            json: true
        };

        request.get(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.a('Array');
            expect(body[0].v).to.be.equal(1);
            expect(body[0].key).to.be.equal('test');
            expect(body[0].macAddress).to.be.equal(deviceAC.macAddress);
            done();
        });
    });

    it('同步配置: 请求失败', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/"+deviceAC.macAddress+"/configuration-sync"),
            body:{
                    "v": 0,
                    "key": 'test',
                    "value": 'newTest'
                },
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body.code).to.be.equal(500);
            expect(body.msg).to.be.equal('request fail');
            done();
        });
    });

    it('同步配置: 请求版本号小于数据库版本号', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/"+deviceAC.macAddress+"/configuration-sync"),
            body: [
                {
                    "v": 0,
                    "key": 'test',
                    "value": 'newTest'
                }
            ],
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.a('Array');
            expect(body[0].v).to.be.equal(1);
            expect(body[0].value).to.be.equal('test');
            done();
        });
    });

    it('同步配置: 请求版本号等于数据库版本号', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/"+deviceAC.macAddress+"/configuration-sync"),
            body: [
                {
                    "v": 1,
                    "key": 'test',
                    "value": 'newTest'
                }
            ],
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.a('Array');
            expect(body[0].v).to.be.equal(1);
            expect(body[0].value).to.be.equal('test');
            done();
        });
    });

    it('同步配置: 请求版本号大于数据库版本号', done => {
        let option = {
            url: url.resolve(baseUrl, "/api/devices/"+deviceAC.macAddress+"/configuration-sync"),
            body: [
                {
                    "v": 2,
                    "key": 'test',
                    "value": 'newTest'
                }
            ],
            json: true
        };

        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.a('Array');
            expect(body[0].v).to.be.equal(2);
            expect(body[0].value).to.be.equal('newTest');
            done();
        });
    });
});
