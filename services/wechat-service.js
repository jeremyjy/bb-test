var nconf = require('nconf');
var Promise = require('bluebird');
var passport = require('passport');
var Customer = Promise.promisifyAll(require('../models/customer-account'));
var Device = Promise.promisifyAll(require('../models/device'));
var UUID = require('node-uuid');
var groupService = require('../services/group-service.js');
var Group = Promise.promisifyAll(require('../models/group.js'));
var Photo = require('../services/util/photo.js');
var download = require('download');
var fs = require('fs');
var flowerService = require('./flower/FlowerService.js');
var wechatService = {};


var wechatAPI = require('../wechat').wechatAPI
var wechatOauthPromise = Promise.promisifyAll(require('../wechat').wechatOauth);


wechatService.getJsConfig = function (req, res, next) {
    var debug = nconf.get('wechat:debug');
    var url = nconf.get('wechat:baseUrl') + '/weixin/';
    var jsApiList = ['configWXDeviceWiFi', 'getWXDeviceTicket', 'openWXDeviceLib', 'closeWXDeviceLib', 'getWXDeviceInfos'];
    var key = nconf.get('airkiss:key');
    wechatAPI.getJsConfig({debug, jsApiList, url, beta: true}, function (err, wechatConfig) {
        if (err) return next(err);
        res.json({wechatConfig});
    });
};


wechatService.message = function (req, res, next) {
    var message = req.weixin;
    console.log(message);
    if (message.MsgType === 'device_event') {
        if (message.Event === 'bind') {
            saveBindRelationship(req, res, next);
        } else if (message.Event === 'unbind') {
            removeBindRelationship(req, res, next);
        }
    } else if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey.indexOf('qrscene_') !== -1) {
                addMemberToGroup(req, res, next);
            }
        } else if (message.Event === 'SCAN') {
            addMemberToGroup(req, res, next);
        }
    } else {
        res.send("");
    }
};


function saveBindRelationship(req, res, next) {
    var message = req.weixin;
    var wechatOpenId = message.OpenID;
    var device = {};
    Customer.findOne({wechatOpenId: wechatOpenId}).then(function (result) {
        if (!result) {
            var customer = new Customer();
            getWechatUser(wechatOpenId)
                .then(function (info) {
                    customer.name = info.nickname;
                    var uuid = UUID.v1();
                    customer.socialAccount = '1' + uuid;
                    customer.socialPassword = uuid;
                    return Photo.getPhoto(customer.socialAccount, info.headimgurl)
                }).then(function (aliInfo) {
                customer.icon = aliInfo.url;
                return Device.findOne({wechatDeviceId: message.DeviceID});
            }).then(function (dev) {
                if (!dev) {
                    return res.status(400).send('no such device!');
                }
                customer.wechatOpenId = message.OpenID;
                customer.deviceId = [];
                device = dev;
                customer.deviceId.push(dev);
                return customer.save();
            }).then(function () {
                return groupService.checkGroup(customer.socialAccount)
            }).then(function (group) {
                if (!group) {
                    return groupService.createGroup(customer, device);
                } else {
                    return groupService.addMember(group, customer.deviceId[0].socialAccount, item.name);
                }
            }).then(function () {
                return res.send({customer: customer, device: device});
            }).catch(function (err) {
                return next(err);
            });
        }
        else {
            if (!result.deviceId.length) {
                return Device.findOne({wechatDeviceId: message.DeviceID}).then(function (device) {
                    if (!device) {
                        return res.status(400).send('no such device!');
                    }
                    return Customer.update({wechatOpenId: wechatOpenId}, {deviceId: [device]})
                }).then(function (result) {
                    return res.send(result);
                });
            } else {
                res.status(500).send('aleady binded!');
            }
        }

    })
    ;
}

function removeBindRelationship(req, res, next) {
    var message = req.weixin;
    var wechatOpenId = message.OpenID;
    Customer.findOne({wechatOpenId: wechatOpenId})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (result) {
        if (result && result.deviceId && result.deviceId.length) {
            result.deviceId.map(function (item) {
                if (item.wechatDeviceId == message.DeviceID) {
                    return Customer.update({wechatOpenId: wechatOpenId}, {deviceId: []}).then(function () {
                        return res.send('unbind success!');
                    });
                }
            })
        } else {
            res.status(500).send('no bund relation!');
        }
    }).catch(function (err) {
        return next(err);
    });
}

wechatService.getOpenId = function (req, res, next) {
    var code = req.query.code || "";
    var openid = req.query.openid;
    if (openid) {
        req.openid = openid;
        return next();
    }
    if (code)
        wechatOauthPromise.getAccessToken(code).then(function (result) {
            req.access_token = result.data.access_token;
            req.openid = result.data.openid;
            next();
        });
};


wechatService.Devices = function (req, res) {
    var openid = req.openid;
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (result) {
        res.redirect("/weixin/#/unbind-device?data=" + JSON.stringify(result));
    });
};

wechatService.unbindDevice = function (req, res, next) {
    var openId = req.query.openId;
    var deviceId = req.query.deviceId;

    unbindWechatDevice(deviceId, openId).then(function () {
        return Customer.findOne({wechatOpenId: openId})
            .populate({path: 'deviceId', select: '-_id'})
            .exec()
    }).then(function (result) {
        if (result && result.deviceId && result.deviceId.length) {
            result.deviceId.map(function (item) {
                if (item.wechatDeviceId === deviceId) {
                    return Customer.update({wechatOpenId: openId}, {deviceId: []}).then(function () {
                        return res.send('unbind totally success!');
                    }).catch(function () {
                        return next(err);
                    });
                }
            })
        } else {
            return res.send('wechat unbind success');
        }
    });
}


wechatService.invteFamilyMember = function (req, res, next) {
    var openid = req.openid;
    Customer.findOne({wechatOpenId: openid}).then(function (customer) {
        return groupService.checkGroup(customer.socialAccount);
    }).then(function (group) {
        if (!group) {
            return res.status(400).send('you are not in a group!');
        }
        wechatAPI.createTmpQRCode(group.number, 86400, function (err, data) {
            if (err) {
                return next(err)
            }
            res.json({qrcode: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + encodeURI(data.ticket)});
        });
    }).catch(function (err) {
        next(err);
    });
}

function addMemberToGroup(req, res, next) {
    var groupNum = null;
    var user = {};
    if (req.weixin.EventKey.indexOf('qrscene_') !== -1) {
        groupNum = req.wexin.EventKey.substr(message.EventKey.indexOf('qrscene_') + 8);
    } else {
        groupNum = req.weixin.EventKey;
    }
    Customer.findOne({wechatOpenId: req.weixin.FromUserName})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        if (!customer) {
            var customer = new Customer();
            return getWechatUser(req.weixin.FromUserName)
                .then(function (info) {
                    customer.name = info.nickname;
                    var uuid = UUID.v1();
                    customer.socialAccount = '1' + uuid;
                    customer.socialPassword = uuid;
                    customer.wechatOpenId = req.weixin.FromUserName;
                    return Photo.getPhoto(customer.socialAccount, info.headimgurl)
                }).then(function (aliInfo) {
                    customer.icon = aliInfo.url;
                }).then(function () {
                    user = customer;
                    customer.save()
                }).then(function () {
                    return groupService.checkGroup(customer.socialAccount);
                })
        }
        user = customer;
        return groupService.checkGroup(user.socialAccount);
    }).then(function (group) {
        if (group) {
            if (group.CreateBy.socialAccount == user.socialAccount) {
                return groupService.mergeGroups(groupNum, group.number);
            }
            if (user.deviceId.length) {
                return groupService.removeMember(group, user.socialAccount).then(function () {
                    return groupService.addMember(groupNum, user.socialAccount, user.name);
                }).then(function () {
                    return groupService.removeMember(group, user.deviceId[0].socialAccount);
                }).then(function () {
                    return groupService.addMember(groupNum, user.deviceId[0].socialAccount, user.deviceId[0].name);
                });
            }
            return groupService.removeMember(group, user.socialAccount).then(function () {
                return groupService.addMember(groupNum, user.socialAccount, user.name);
            });
        }
        if (user.deviceId.length) {
            return groupService.addMember(groupNum, user.socialAccount, user.name)
                .then(function () {
                    return groupService.addMember(groupNum, user.deviceId[0].socialAccount, user.deviceId[0].name);
                });
        }
        return groupService.addMember(groupNum, user.socialAccount, user.name);
    }).then(function () {
        res.send("join group sccuess");
        return Group.findOne({number: groupNum});
    }).then(function (group) {
            var memberArray = [];
            for (var i = 0; i < group.members.length; i++) {
                if (group.members[i].socialAccount[0] === '1') {
                    memberArray.push(group.members[i].socialAccount);
                }
            }
            return groupService.findGroupMember(memberArray);
        })
        .then(function (array) {
            return Promise.all(array.map(function (item) {
                wechatSendText(item.wechatOpenId, user.name + " join group!")
            })).catch(function () {
            });
        }).catch(function (err) {
        next(err);
    });
}

wechatService.exitGroup = function (req, res, next) {
    var openid = req.openid;
    var family = {};
    var user = null;
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        user = customer;
        return groupService.checkGroup(user.socialAccount);
    }).then(function (group) {
        family = group
        if (user.socialAccount === group.CreateBy.socialAccount) {
            return groupService.removeGroup(group.number);
        } else {
            if (user.deviceId.length) {
                return groupService.removeMember(group, user.deviceId[0].socialAccount).then(function () {
                    return groupService.removeMember(group, user.socialAccount);
                });
            } else {
                return groupService.removeMember(group, user.socialAccount);
            }
        }
    }).then(function () {
            res.send('exit group success!');
            var memberArray = [];
            for (var i = 0; i < family.members.length; i++) {
                if (family.members[i].socialAccount[0] === '1') {
                    memberArray.push(family.members[i].socialAccount);
                }
            }
            return groupService.findGroupMember(memberArray);
        })
        .then(function (array) {
            return Promise.all(array.map(function (item) {
                wechatSendText(item.wechatOpenId, user.name + " leave group!")
            })).catch(function () {
            });
        }).catch(function (err) {
        return next(err);
    });
};

function getWechatUser(openId) {
    return new Promise(function (resolve, reject) {
        wechatAPI.getUser(openId, function (err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}


wechatService.showFamilyMembers = function (req, res, next) {
    var openid = req.openid;
    var data = {};
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        data.customer = customer;
        return groupService.checkGroup(customer.socialAccount);
    }).then(function (group) {
        var deviceArr = [];
        group.members.map(function (item) {
            if (item.socialAccount.indexOf('0') === 0) {
                deviceArr.push(item.socialAccount);
            }
        });
        data.group = group;
        if (deviceArr) {
            return Device.find({socialAccount: {$in: deviceArr}});
        }
        res.json(data);
    }).then(function (result) {
        var results = {};
        for (var i in result) {
            results[result[i].socialAccount] = result[i];
        }
        data.device = results;
        res.json(data);
    }).catch(function (err) {
        next(err);
    });
};


wechatService.changeNickName = function (req, res, next) {
    var openid = req.openid;
    var socialAccount = req.query.socialAccount;
    var nickName = req.query.nickname;
    var user = {};
    return Customer.findOne({wechatOpenId: openid}).then(function (customer) {
        user = customer;
        return groupService.checkGroup(customer.socialAccount);
    }).then(function (group) {
        return groupService.removeMember(group, socialAccount).then(function () {
            return groupService.addMember(group.number, socialAccount, nickName);
        });
    }).then(function (gro) {
        res.send(gro);
    }).catch(function (err) {
        next(err);
    });
};

function unbindWechatDevice(deviceId, openId) {
    return new Promise(function (resolve, reject) {
        wechatAPI.compelUnbindDevice(deviceId, openId, function (err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });

    });
}

wechatService.showDeviceQRcode = function (req, res, next) {
    var openid = req.openid;
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        if (customer.deviceId.length) {
            var url = nconf.get('wechat:baseUrl') + '/wechat/addDeviceFriends?openid=' + customer.wechatOpenId + '&socialAccount=' + customer.deviceId[0].socialAccount;
            return res.json({url: url, device: customer.deviceId[0]});
        }
        return res.status(400).send('no device!');
    });
};

wechatService.addDeviceFriends = function (req, res, next) {
    var openid = req.openid;
    var openidToAdd = req.query.openidtoadd;
    var deviceSocialAccount = req.query.socialAccount;
    var user = {};
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        user = customer;
        return Device.findOne({socialAccount: deviceSocialAccount});
    }).then(function (device) {
        for (var i = 0; i < user.deviceId[0].friends.length; i++) {
            if (user.deviceId[0].friends[i].socialAccount === device.socialAccount) {
                return Promise.resolve();
            }
        }
        user.deviceId[0].friends.push({
            socialAccount: device.socialAccount,
            nickName: device.name,
            status: 0
        });
        return Device.update({socialAccount: user.deviceId[0].socialAccount}, {
            friends: user.deviceId[0].friends
        });
    }).then(function () {
        res.send('add friend success wait for confirm');
        var artcles = [
            {
                "title": "a new friend request!",
                "description": openid + " want to add you to his/her friends list",
                "url": nconf.get('wechat:baseUrl') + "/wechat/confirmDeviceFriends?socialAccount=" + user.deviceId[0].socialAccount,
                "picurl": "PIC_URL"
            }
        ];
        return wechatSendNews(openidToAdd, artcles).catch(function () {
        });
    }).catch(function (err) {
        next(err);
    });
};

wechatService.confirmDeviceFriends = function (req, res, next) {
    var openid = req.openid;
    var user = {};
    var socialAccount = req.query.socialAccount;
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        user = customer;
        return Device.findOne({socialAccount: socialAccount})
    }).then(function (device) {
        var friend = {};
        device.friends.map(function (item) {
            if (item.socialAccount === user.deviceId[0].socialAccount) {
                if (item.status != -1 && item.status != 1) {
                    flowerService.addFlower(device.macAddress, 'addFriend')
                }
                item.status = 1;
            }
        });
        return Device.update({socialAccount: socialAccount}, {friends: device.friends}).then(function () {
            var isOld = false;
            user.deviceId[0].friends.map(function (item) {
                if (item.socialAccount == device.socialAccount) {
                    if (item.status != -1 && item.status != 1) {
                        flowerService.addFlower(user.deviceId[0].macAddress, 'addFriend')
                    }
                    item.status = 1;
                    isOld = true;
                }
            });
            if (!isOld) {
                user.deviceId[0].friends.push({
                    socialAccount: device.socialAccount,
                    nickName: device.name,
                    status: 1
                });
                flowerService.addFlower(user.deviceId[0].macAddress, 'addFriend')
            }
            return Device.update({socialAccount: user.deviceId[0].socialAccount}, {
                friends: user.deviceId[0].friends
            });
        })
    }).then(function () {
        res.send('confirm success!');
    }).catch(function (err) {
        res.send(err);
    })
};

wechatService.showDeviceFriends = function (req, res, next) {
    var openid = req.openid;
    var user = {};
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        user = customer;
        if (!customer.deviceId.length) {
            return res.status(400).send('no device!');
        }
        if (customer.deviceId[0].friends) {
            var friendArr = [];
            for (var friend in customer.deviceId[0].friends) {
                friendArr.push(customer.deviceId[0].friends[friend].socialAccount);
            }
            return Device.find({socialAccount: {$in: friendArr}})
        }
        return res.json({friends: customer.deviceId[0].friends});
    }).then(function (result) {
        var results = {};
        for (var i in result) {
            results[result[i].socialAccount] = result[i];
        }
        res.json({devices: results, friends: user.deviceId[0].friends});
    }).catch(function (err) {
        next(err);
    })
};

wechatService.removeDeviceFriends = function (req, res, next) {
    var openid = req.openid;
    var socialAccount = req.query.socialAccount;
    var user = {};
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        user = customer;
        var friend = {};
        customer.deviceId[0].friends.map(function (item) {
            if (item.socialAccount == socialAccount) {
                item.status = -1;
            }
        });
        return Device.update({socialAccount: customer.deviceId[0].socialAccount}, {
            friends: customer.deviceId[0].friends
        })
    }).then(function () {
        return Device.findOne({socialAccount: socialAccount})
    }).then(function (device) {
        var friend = {};
        device.friends.map(function (item) {
            if (item.socialAccount == user.deviceId[0].socialAccount) {
                item.status = -1;
            }
        });
        return Device.update({socialAccount: device.socialAccount}, {
            friends: device.friends
        })
    }).then(function () {
        res.send('remove device friends success!')
    }).catch(function (err) {
        next(err);
    });
};


function wechatSendText(openid, text) {
    return new Promise(function (resolve, reject) {
        wechatAPI.sendText(openid, text, function (err, res) {
            if (err) {
                return reject(err);
            }
            resolve(res);
        })
    })
}

function wechatSendNews(openid, article) {
    return new Promise(function (resolve, reject) {
        wechatAPI.sendNews(openid, article, function (err, res) {
            if (err) {
                return reject(err);
            }
            resolve(res);
        })
    })
}

wechatService.changeFriendNickName = function (req, res, next) {
    var openid = req.openid;
    var socialAccount = req.query.socialAccount;
    var nickName = req.query.nickname;
    var user = {};
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        user = customer;
        customer.deviceId[0].friends.map(function (item) {
            if (item.socialAccount == socialAccount) {
                friend = item;
            }
        });
        return Device.findOneAndUpdate({socialAccount: customer.deviceId[0].socialAccount}, {
            $pull: {
                friends: friend
            }
        })
    }).then(function (device) {
        return Device.findOneAndUpdate({socialAccount: user.deviceId[0].socialAccount}, {
            $addToSet: {
                friends: {
                    socialAccount: socialAccount,
                    nickName: nickName,
                    status: 1
                }
            }
        });
    }).then(function () {
        res.send('change nickname success!');
    }).catch(function () {
        res.status(400).send('change nickname failed!');
    });
};

wechatService.changeDeviceName = function (req, res, next) {
    var openid = req.openid;
    var name = req.query.name;
    Customer.findOne({wechatOpenId: openid})
        .populate({path: 'deviceId', select: '-_id'})
        .exec().then(function (customer) {
        return Device.findOneAndUpdate({socialAccount: user.deviceId[0].socialAccount}, {name: name});
    }).then(function () {
        res.send('change device name success!');
    }).catch(function (err) {
        next(err);
    })
};
module.exports = wechatService;