/**
 * Created by JeremyNg on 16/7/5.
 */
var moment = require('moment')
var Promise = require('blueBird');
var FlowerAct = Promise.promisifyAll(require('../../models/flower-award-activity'));
var FlowerRule = Promise.promisifyAll(require('../../models/flower-award-rule'));
var Device = Promise.promisifyAll(require('../../models/device'));

function getOneDay(dateStr) {
    var oneDay = {};
    if (!dateStr) {
        dateStr = moment().format('YYYY-M-D')
    }
    oneDay.start = new Date(dateStr);
    oneDay.end = new Date(dateStr + ' 23:59:59');
    return oneDay;
}

function isLeapYear(year) {
    return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0);
}

function getDays(year, month) {
    if (!arguments.length) {
        var date = new Date();
        year = date.getFullYear();
        month = date.getMonth();
    }
    var bigMon = [1, 3, 5, 7, 8, 10, 12];
    var smallMon = [4, 6, 9, 11];
    if (bigMon.indexOf(month) != -1) {
        return 31;
    }
    if (smallMon.indexOf(month) != -1) {
        return 30;
    }
    if (!isLeapYear(year)) {
        return 28;
    }
    return 29;
}

function flowerService() {
    this.addFlower = function (macAddress, behaviorCode, cb) {
        var today = moment().format('YYYY-M-D');
        var data = {
            device: {},
            behavior: behaviorCode
        }
        return new Promise(function (resolve, reject) {
            var rule = {};
            return Device.findOne({macAddress: macAddress}).then(function (dev) {
                data.device = dev;
                return FlowerRule.findOne({behaviorCode: behaviorCode})
            }).then(function (ru) {
                rule = ru;
                return FlowerAct.findOne({rule: rule, deviceId: data.device, flowerAwardDate: today})
                    .populate({path: 'deviceId', select: '-_id'})
                    .populate({path: 'rule', select: '-_id'})
                    .exec()
            }).then(function (act) {
                if (!act) {

                    var flowerAct = new FlowerAct();
                    flowerAct.deviceId = data.device;
                    flowerAct.rule = rule;
                    flowerAct.flowerAwardDate = today;
                    flowerAct.flowers = rule.flowersOnce;
                    data.flowers = rule.flowersOnce;
                    data.addflowers = rule.flowersOnce;
                    return flowerAct.save();
                }
                data.flowersLimit = act.rule.flowersLimit;
                data.flowersOnce = act.rule.flowersOnce;
                if (act.flowers >= act.rule.flowersLimit) {
                    data.flowers = act.flowers;
                    data.addflowers = 0;
                    return resolve(data);
                }
                data.flowers = rule.flowersOnce + act.flowers;
                data.addflowers = rule.flowersOnce;
                if (data.flowers > rule.flowersLimit) {
                    data.flowers = rule.flowersLimit;
                    data.addflowers = rule.flowersLimit - act.flowers
                }
                return FlowerAct.update({
                    rule: rule,
                    deviceId: data.device,
                    flowerAwardDate: today
                }, {flowers: data.flowers})
            }).then(function () {
                return Device.findOneAndUpdate({socialAccount: data.device.socialAccount}, {$inc: {totalFlowers: data.addflowers}})
            }).then(function () {
                resolve(data);
            }).catch(function (err) {
                reject(err)
            })
        })

    }

    this.calculate = function (macAddress, year, month) {
        return new Promise(function (resolve, reject) {
            if (!year) {
                year = new Date().getFullYear();
                month = new Date().getMonth();
            }
            var days = getDays(year, month);
            var monthArr = [];
            var continueDays = 0;
            for (var i = 1; i <= days; i++) {
                monthArr.push(year + '-' + (month + 1) + '-' + i);
            }
            var caculation = {};
            return Device.findOne({macAddress: macAddress}).then(function (dev) {
                return FlowerAct.find({flowerAwardDate: {$in: monthArr}, deviceId: dev})
                    .populate({path: 'deviceId', select: '-_id'})
                    .populate({path: 'rule', select: '-_id'})
                    .exec()
            }).then(function (acts) {
                if (!acts.length) {
                    return resolve()
                }
                acts.map(function (item) {
                    if (!caculation[item.flowerAwardDate]) {
                        caculation[item.flowerAwardDate] = {};
                    }
                    caculation[item.flowerAwardDate][item.rule.behaviorCode] = item.flowers;
                });
                for (var i = new Date().getDate(); i > 0; i--) {
                    if (caculation[year + '-' + (month + 1) + '-' + i]) {
                        continueDays++;
                    } else {
                        break;
                    }
                }
                caculation.continueDays = continueDays;
                resolve(caculation);
            }).catch(function (err) {
                reject(err);
            })
        })
    };
    this.checkFlowers = function (macAddress, date) {
        return new Promise(function (resolve, reject) {
            if (!date) {
                date = moment().format('YYYY-M-D');
            }
            var data = {
                totalFlowers: 0,
                flowersToday: 0
            };
            return Device.findOne({macAddress: macAddress}).then(function (device) {
                if (!device) {
                    return reject(new Error(400, 'device does not exist!'));
                }
                data.totalFlowers = device.totalFlowers;
                return FlowerAct.find({flowerAwardDate: date, deviceId: device})
                    .populate({path: 'rule', select: '-_id'})
                    .exec()
            }).then(function (acts) {
                    data.detail = {};
                    acts.map(function (item) {
                        data.flowersToday += item.flowers;
                        data.detail[item.rule.behaviorCode] = item.flowers;
                    })
                    resolve(data)
                })
                .catch(function (err) {
                    reject(err);
                })
        })
    }
}


module.exports = new flowerService();