/**
 * Created by JeremyNg on 16/7/6.
 */
var Promise = require('blueBird');
var flowerRule = Promise.promisifyAll(require('../../models/flower-award-rule'));
var flowerCate = Promise.promisifyAll(require('../../models/flower-award-category'));
var defaultConfig = {
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
function FlowerAwardRuleHandler() {
    this.init = function (config) {
        var data = {};
        if (!config) {
            config = defaultConfig;
        }
        return new Promise(function (resolve, reject) {
            Promise.all(config.Category.map(function (item) {
                var cate = new flowerCate(item);
                return cate.save();
            })).then(function (cates) {
                data.categories = cates;
                return Promise.all(config.Rule.map(function (item) {
                    return flowerCate.findOne({code: item.category}).then(function (cate) {
                        var rule = new flowerRule();
                        rule.behaviorName = item.behaviorName;
                        rule.behaviorCode = item.behaviorCode;
                        rule.flowersOnce = item.flowersOnce;
                        rule.flowersLimit = item.flowersLimit;
                        rule.categoryId = cate;
                        return rule.save();
                    })
                }))
            }).then(function (rules) {
                data.rules = rules;
                resolve(data);
            }).catch(function (err) {
                reject(err);
            })
        })
    };
    this.addRule = function (config) {
        return flowerCate.findOne({code: config.category}).then(function (cate) {
            var rule = new flowerRule();
            rule.behaviorName = item.behaviorName;
            rule.behaviorCode = item.behaviorCode;
            rule.flowersOnce = config.flowersOnce;
            rule.flowersLimit = config.flowersLimit;
            rule.categoryId = cate;
            return rule.save();
        })

    };
    this.addCategory = function (config) {
        var cate = new flowerCate(config);
        return cate.save();
    }
};

module.exports = new FlowerAwardRuleHandler();