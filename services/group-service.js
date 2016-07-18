/**
 * Created by JeremyNg on 16/6/21.
 */
var Promise = require('bluebird');
var Group = Promise.promisifyAll(require('../models/group.js'));
var Customer = Promise.promisifyAll(require('../models/customer-account'));

var GroupSerives = function () {
    var self = this;
    this.createGroup = function (owner,device) {
        var group = new Group;
        group.name = owner.name;
        group.CreateBy = owner;
        group.CreateTime = new Date();
        group.members = [];
        group.members.push({socialAccount: owner.socialAccount, nickName: owner.name});
        if(owner.deviceId && owner.deviceId.length){
                group.members.push({socialAccount: device.socialAccount, nickName: device.name})
        }
        return group.save();
    };
    this.addMember = function (groupNum, socialAccount, nickname) {
        return Group.findOneAndUpdate({number: groupNum}, {
            $addToSet: {
                members: {
                    socialAccount: socialAccount,
                    nickName: nickname
                }
            }
        });
    };
    this.removeMember = function (group, socialAccount) {
        var nickName = '';
        group.members.map(function (item) {
            if (item.socialAccount == socialAccount){
                nickName = item.nickName;
            }
        });
        return Group.findOneAndUpdate({number: group.number}, {
            $pull: {
                members: {
                    socialAccount: socialAccount,
                    nickName: nickName
                }
            }
        });

    };
    this.removeGroup = function (groupNum) {
        return Group.remove({number: groupNum});
    };
    this.checkGroup = function (socialAccount) {
        return Group.findOne({"members.socialAccount": socialAccount}).populate({path: 'CreateBy', select: '-_id'}).exec();
    };
    this.mergeGroups = function (groupNum1, groupNum2) {
        return Group.findOne({number: groupNum2})
            .then(function (result) {
                return Group.findOneAndUpdate({number: groupNum1}, {$addToSet: {members: {$each: result.members}}})
            }).then(function () {
                return Group.remove({number: groupNum2});
            });
    };
    this.findGroupMember = function (socialArray) {
        return Promise.all(socialArray.map(function (item) {
            return Customer.findOne({socialAccount: item});
        }))
    }
}
module.exports = new GroupSerives();