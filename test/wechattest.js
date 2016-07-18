var request = require("request");
var Promise = require('bluebird')
var crypto = require("crypto");
var expect = require('chai').expect;
var url = require('url');
var WeChatAPI = require('wechat-api');
require('../nconf');
require('../mongoose')
var mongoose = require('mongoose');
var Device = mongoose.model('Device');
var Customer = mongoose.model('CustomerAccount');
var Group = mongoose.model('Group');
var FlowerAct = Promise.promisifyAll(mongoose.model('FlowerAwardActivity'));
var FlowerRule = Promise.promisifyAll(mongoose.model('FlowerAwardRule'));
var FlowerCate = Promise.promisifyAll(mongoose.model('FlowerAwardCategory'));


var config = {
    appid: 'wxc0d52bc7e3debfdd',
    appsecret: 'e381480f72ab3e1486db465670662253',
    token: 'bbcloudtoken123',
    devicetype: "gh_9a0ccaa5f56d",
    deviceid: "gh_9a0ccaa5f56d_e0cf1c8d5aca1454",
    //openid: "o2eEHs5NaBDvqXZ3fPwSN_NVdJS0"
    "openid": [
        "o20X8wqnihCqIToftlGzjCwr2RfE",
        "o20X8wlhq5vGzfZVENemVoEnp-MY",
        "o20X8wqmTCjbyqZg8WDVSdOuEjzA",
        "o20X8wmzslFdRvrO-DeHzpUfVF7c",
        "o20X8wjSg1h1CU8EGjgQQNt0Nzy4",
        "o20X8wqQdRDydUuZ8-H3uNIIowQ0",
        "o20X8wuY_gNdxP1rco86urUqe7Hs",
        "o20X8wgoz3clv0MAimOYuMyqmI6Y"
    ]
}
var baseUrl = 'http://127.0.0.1:3000';


/**
 * 检查签名
 */
function genSignature(timestamp, nonce, token) {
    var shasum = crypto.createHash('sha1');
    var arr = [token, timestamp, nonce].sort();
    shasum.update(arr.join(''));
    return shasum.digest('hex');
};


describe('微信测试', function () {
    before(function (done) {
        var device = new Device();
        device.serialNumber = 'serialNumber';
        device.macAddress = 'macaddress' ;
        device.name = 'tester';
        device.socialAccount = 'testsocial'
        device.bbcloudDeviceId = 'bbcloudDeviceId';
        device.wechatDeviceId = 'gh_9a0ccaa5f56d_e0cf1c8d5aca1454';
        device.save(done)
    })
    var timestamp = new Date().getTime();
    var nonce = '1443073299';
    var token = config.token;
    var signature = genSignature(timestamp, nonce, token);
    it('新增用户和绑定成功', function (done) {
        var xml = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
            "<ToUserName><![CDATA[" + signature + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + signature + "]]></FromUserName>" +
            "<CreateTime>" + timestamp + "</CreateTime>" +
            "<MsgType><![CDATA[device_event]]></MsgType>" +
            "<Event><![CDATA[bind]]></Event>" +
            "<DeviceType><![CDATA[" + signature + "]]></DeviceType>" +
            "<DeviceID><![CDATA[" + config.deviceid + "]]></DeviceID>" +
            "<Content><![CDATA[xxxxxxx]]></Content>" +
            "<SessionID>123121</SessionID>" +
            "<OpenID><![CDATA[" + config.openid[0] + "]]></OpenID></xml>";
        var option = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
            body: xml
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            //expect(body).to.be.equal('create User and Bind success!');
            done();
        });
    });
    it('已存在绑定关系', function (done) {
        var xml = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
            "<ToUserName><![CDATA[" + signature + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + signature + "]]></FromUserName>" +
            "<CreateTime>" + timestamp + "</CreateTime>" +
            "<MsgType><![CDATA[device_event]]></MsgType>" +
            "<Event><![CDATA[bind]]></Event>" +
            "<DeviceType><![CDATA[" + signature + "]]></DeviceType>" +
            "<DeviceID><![CDATA[" + config.deviceid + "]]></DeviceID>" +
            "<Content><![CDATA[xxxxxxx]]></Content>" +
            "<SessionID>123121</SessionID>" +
            "<OpenID><![CDATA[" + config.openid[0] + "]]></OpenID></xml>";
        var option = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
            body: xml
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(500);
            expect(body).to.be.equal('aleady binded!');
            done();
        });
    });
    it('缺少签名认证', function (done) {
        var xml = "<xml><URL><![CDATA[http://6f7930fa.ittun.com/wechat/message]]></URL><ToUserName><![CDATA[gh_9a0ccaa5f56d]]></ToUserName><FromUserName><![CDATA[xxxxxxx]]></FromUserName><CreateTime>123424235</CreateTime><MsgType><![CDATA[device_event]]></MsgType><Event><![CDATA[bind]]></Event><DeviceType><![CDATA[gh_9a0ccaa5f56d]]></DeviceType><DeviceID><![CDATA[gh_9a0ccaa5f56d_e0cf1c8d5aca1454]]></DeviceID><Content><![CDATA[xxxxxxx]]></Content><SessionID>123121</SessionID><OpenID><![CDATA[dsf23d2]]></OpenID></xml>";

        var option = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp),
            body: xml
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(401);
            done();
        });
    });
    it('解绑事件测试', function (done) {
        var xml = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
            "<ToUserName><![CDATA[" + signature + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + signature + "]]></FromUserName>" +
            "<CreateTime>" + timestamp + "</CreateTime>" +
            "<MsgType><![CDATA[device_event]]></MsgType>" +
            "<Event><![CDATA[unbind]]></Event>" +
            "<DeviceType><![CDATA[" + signature + "]]></DeviceType>" +
            "<DeviceID><![CDATA[" + config.deviceid + "]]></DeviceID>" +
            "<Content><![CDATA[xxxxxxx]]></Content>" +
            "<SessionID>123121</SessionID>" +
            "<OpenID><![CDATA[" + config.openid[0] + "]]></OpenID></xml>";

        var option = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
            body: xml
        };
        request.post(option, (err, res, body) => {
            console.log(body)
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.equal('unbind success!');
            done();
        });
    });
    it('解绑不存在的设备', function (done) {
        var xml = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
            "<ToUserName><![CDATA[" + signature + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + signature + "]]></FromUserName>" +
            "<CreateTime>" + timestamp + "</CreateTime>" +
            "<MsgType><![CDATA[device_event]]></MsgType>" +
            "<Event><![CDATA[unbind]]></Event>" +
            "<DeviceType><![CDATA[" + signature + "]]></DeviceType>" +
            "<DeviceID><![CDATA[" + signature + "]]></DeviceID>" +
            "<Content><![CDATA[xxxxxxx]]></Content>" +
            "<SessionID>123121</SessionID>" +
            "<OpenID><![CDATA[" + signature + "]]></OpenID></xml>";

        var option = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
            body: xml
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(500);
            expect(body).to.be.equal('no bund relation!');
            done();
        });
    });
    it('解绑设备', function (done) {
        var wechatAPI = new WeChatAPI(config.appid, config.appsecret);
        wechatAPI.compelBindDevice(config.deviceid, config.openid, function (err) {
            expect(err).to.be.equal(null);
            var xml = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
                "<ToUserName><![CDATA[" + config.devicetype + "]]></ToUserName>" +
                "<FromUserName><![CDATA[" + config.openid[0] + "]]></FromUserName>" +
                "<CreateTime>" + timestamp + "</CreateTime>" +
                "<MsgType><![CDATA[device_event]]></MsgType>" +
                "<Event><![CDATA[bind]]></Event>" +
                "<DeviceType><![CDATA[" + config.devicetype + "]]></DeviceType>" +
                "<DeviceID><![CDATA[" + config.deviceid + "]]></DeviceID>" +
                "<Content><![CDATA[xxxxxxx]]></Content>" +
                "<SessionID>123121</SessionID>" +
                "<OpenID><![CDATA[" + config.openid[0] + "]]></OpenID></xml>";

            var option = {
                url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
                body: xml
            };
            request.post(option, (err, res, body) => {
                expect(err).to.be.equal(null);
                request(baseUrl+"/api/wechat/unbindDevice?openId="+config.openid[0]+"&deviceId="+config.deviceid, function (err, res, body) {
                    expect(err).to.be.equal(null);
                    expect(res.statusCode).to.be.equal(200);
                    expect(body).to.be.equal('unbind totally success!');
                    done();

                })
            });
        });
    });
    after(function (done) {
        Device.remove({}, function () {
            Customer.remove({},done)
        });
    })
})

describe('配置信息', function () {
    it('查询成功',function(done){
        request(baseUrl+'/api/wechat/getJsApiConfig', function (err, res, body) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            done();
        })
    })
})


describe('社交测试', function () {
    before(function (done) {
        var device = new Device();
        device.serialNumber = 'grouptest1';
        device.macAddress = 'grouptest1';
        device.name = 'grouptest1';
        device.socialAccount = 'grouptest1'
        device.bbcloudDeviceId = 'grouptest1';
        device.wechatDeviceId = 'grouptest1';
        var device2 = new Device();
        device2.serialNumber = 'grouptest2';
        device2.macAddress = 'grouptest2';
        device2.name = 'grouptest2';
        device2.socialAccount = 'grouptest2';
        device2.bbcloudDeviceId = 'grouptest2';
        device2.wechatDeviceId = 'grouptest2';
        device.save(function () {
            device2.save(done)
        })
    })
    var groupNum = 0;
    var user = {};
    var user2 = {};
    var timestamp = new Date().getTime();
    var nonce = '1443073292';
    var token = config.token;
    var signature = genSignature(timestamp, nonce, token);
    it('创建群组', function (done) {
        var xml = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
            "<ToUserName><![CDATA[" + signature + "]]></ToUserName>" +
            "<FromUserName><![CDATA[testuser1]]></FromUserName>" +
            "<CreateTime>" + timestamp + "</CreateTime>" +
            "<MsgType><![CDATA[device_event]]></MsgType>" +
            "<Event><![CDATA[bind]]></Event>" +
            "<DeviceType><![CDATA[" + signature + "]]></DeviceType>" +
            "<DeviceID><![CDATA[grouptest1]]></DeviceID>" +
            "<Content><![CDATA[xxxxxxx]]></Content>" +
            "<SessionID>123121</SessionID>" +
            "<OpenID><![CDATA[" + config.openid[0] + "]]></OpenID></xml>";
        var xml2 = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
            "<ToUserName><![CDATA[" + signature + "]]></ToUserName>" +
            "<FromUserName><![CDATA[testuser2]]></FromUserName>" +
            "<CreateTime>" + timestamp + "</CreateTime>" +
            "<MsgType><![CDATA[device_event]]></MsgType>" +
            "<Event><![CDATA[bind]]></Event>" +
            "<DeviceType><![CDATA[" + signature + "]]></DeviceType>" +
            "<DeviceID><![CDATA[grouptest2]]></DeviceID>" +
            "<Content><![CDATA[xxxxxxx]]></Content>" +
            "<SessionID>123121</SessionID>" +
            "<OpenID><![CDATA[" + config.openid[1] + "]]></OpenID></xml>";
        var option = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
            body: xml
        };
        var option2 = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
            body: xml2
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            user = JSON.parse(body).customer;
            user.device = JSON.parse(body).device;
            request.post(option2, (err, res, body) => {
                user2 = JSON.parse(body).customer;
                user2.device = JSON.parse(body).device;
                done();
            })
        });
    });
    it('邀请家人', function (done) {
        request.get(baseUrl + "/wechat/inviteFamilyMember?openid=" + config.openid[0] , (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            done();
        })
    })
    it('查看群组', function (done) {
        request.get(baseUrl + "/wechat/showFamilyMembers?openid=" + config.openid[0] , (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            groupNum = JSON.parse(body).group.number;
            done();
        })
    })
    it('加入家庭', function (done) {
        var xml = "<xml><URL><![CDATA[http://test.tester.com/wechat/message]]></URL>" +
            "<ToUserName><![CDATA[" + signature + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + config.openid[1] + "]]></FromUserName>" +
            "<CreateTime>" + timestamp + "</CreateTime>" +
            "<MsgType><![CDATA[event]]></MsgType>" +
            "<Event><![CDATA[SCAN]]></Event>" +
            "<EventKey><![CDATA[" + groupNum + "]]></EventKey>" +
            "<OpenID><![CDATA[" + config.openid[1] + "]]></OpenID></xml>";
        var option = {
            url: url.resolve(baseUrl, "/wechat?signature=" + signature + "&timestamp=" + timestamp + "&nonce=" + nonce),
            body: xml
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.equal("join group sccuess");
            done();
        })
    })
    it('修改昵称', function (done) {
        request.get(baseUrl + "/wechat/changeNickName?openid=" + config.openid[0] + "&socialAccount="+ user.socialAccount+"&nickname=xxx", (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            done();
        })
    })
    it('修改设备昵称', function (done) {
        request.get(baseUrl + "/wechat/changeNickName?openid=" + config.openid[0] + "&socialAccount="+ user.device.socialAccount+"&nickname=xxx", (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            done();
        })
    })
    it('退出家庭圈', function (done) {
        request.get(baseUrl + "/wechat/exitGroup?openid=" + config.openid[1] + "&socialAccount="+ user.device.socialAccount+"&nickname=xxx", (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.equal('exit group success!');
            done();
        })
    })
    it('设备信息', function (done) {
        request.get(baseUrl + "/wechat/showDeviceQRcode?openid=" + config.openid[1] , (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            done();
        })
    })
    it('添加设备好友', function (done) {
        request.get(baseUrl + "/wechat/addDeviceFriends?openid=" + config.openid[1] + "&openidtoadd=o2eEHswH2dDQYwmeo-N6Vs1H-WYs&socialAccount="+ user.device.socialAccount, (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.equal('add friend success wait for confirm');
            done();
        })
    })
    it('确认添加设备好友', function (done) {
        request.get(baseUrl + "/wechat/confirmDeviceFriends?openid=" + config.openid[0] + "&socialAccount="+ user2.device.socialAccount, (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.equal('confirm success!');
            done();
        })
    })
    it('修改好友昵称', function (done) {
        request.get(baseUrl + "/wechat/changeFriendNickName?openid=" + config.openid[0] + "&socialAccount="+ user2.device.socialAccount+"&nickname=yyy", (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.equal('change nickname success!');
            done();
        })
    })
    it('删除好友', function (done) {
        request.get(baseUrl + "/wechat/removeDeviceFriends?openid=" + config.openid[0] + "&socialAccount="+ user2.device.socialAccount, (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            expect(body).to.be.equal('remove device friends success!');
            done();
        })
    })
    // after(function (done) {
    //     Device.remove({}, function () {
    //         Customer.remove({},done)
    //     });
    // })
})

describe('小红花测试', function () {
    var config = {
        Category: [
            {code:'signature',name:'每日签到'},
            {code:'sharingOrCommunication',name:'每日分享交流'},
            {code:'task',name:'每日任务'},
            {code:'habit',name:'生活习惯'}
        ],
        Rule: [
            {
                category: 'signature',
                behaviorName: '每日签到',
                behaviorCode: 'signIn',
                flowersOnce: 1,
                flowersLimit: 1
            },
            {
                category: 'sharingOrCommunication',
                behaviorName: '分享',
                behaviorCode: 'share',
                flowersOnce: 1,
                flowersLimit: 1
            },
            {
                category: 'sharingOrCommunication',
                behaviorName: '主动与好友设备语音聊天',
                behaviorCode: 'chatWithFriends',
                flowersOnce: 1,
                flowersLimit: 1
            },
            {
                category: 'sharingOrCommunication',
                behaviorName: '主动与家庭圈语音聊天',
                behaviorCode: 'chatWithFamily',
                flowersOnce: 1,
                flowersLimit: 1
            },
            {
                category: 'sharingOrCommunication',
                behaviorName: '添加朋友',
                behaviorCode: 'addFriend',
                flowersOnce: 1,
                flowersLimit: 999
            },
            {
                category: 'task',
                behaviorName: '设备听完整故事',
                behaviorCode: 'listenStory',
                flowersOnce: 1,
                flowersLimit: 12
            },
            {
                category: 'habit',
                behaviorName: '自定义习惯',
                behaviorCode: 'performCustomHabit',
                flowersOnce: 1,
                flowersLimit: 6
            }
        ]
    };
    before(function (done) {
        Promise.all(config.Category.map(function (item) {
            var cate = new FlowerCate(item);
            return cate.save();
        })).then(function (cates) {
            return Promise.all(config.Rule.map(function (item) {
                return FlowerCate.findOne({code: item.category}).then(function (cate) {
                    var rule = new FlowerRule();
                    rule.behaviorName = item.behaviorName;
                    rule.behaviorCode = item.behaviorCode;
                    rule.flowersOnce = item.flowersOnce;
                    rule.flowersLimit = item.flowersLimit;
                    rule.categoryId = cate;
                    return rule.save();
                })
            }))
        }).then(function () {
            done()
        });
    })
    it('上线添加小红花', function (done) {
        request.get(baseUrl + '/api/devices/status?data={"status": "online","appId": "12231","deviceSn": "sss","deviceId": "grouptest1","time": "2015-12-23 00:00:00"}', (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            var data = JSON.parse(body);
            expect(data.addflowers).to.be.equal(1)
            done();
        })
    })
    it('设备查询小红花',function (done) {
        request.get(baseUrl + '/api/devices/grouptest1/flowers', (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            var data = JSON.parse(body);
            expect(data.totalFlowers).to.be.equal(1)
            done();
        })
    })
    it('查看每天小红花',function (done) {
        request.get(baseUrl + '/api/wechat/checkFlowers?openid=o20X8wqnihCqIToftlGzjCwr2RfE', (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            var data = JSON.parse(body);
            expect(data.detail.signIn).to.be.equal(1)
            done();
        })
    })
    it('统计小红花',function (done) {
        request.get(baseUrl + '/api/wechat/calculateFlowers?openid=o20X8wqnihCqIToftlGzjCwr2RfE', (err, res, body) => {
            expect(res.statusCode).to.be.equal(200);
            var data = JSON.parse(body);
            expect(data.customer.deviceId [0].totalFlowers).to.be.equal(1)
            done();
        })
    })

    after(function (done) {
        FlowerAct.remove({}).then(function () {
            return FlowerCate.remove({})
        }).then(function () {
            return FlowerRule.remove({})
        }).then(function () {
            Device.remove({}, function () {Customer.remove({},done)})
        })
        
    })
})