var fs = require('fs');
var _ = require('lodash');
var nconf = require('nconf');
var request = require('request');
var Promise = require('bluebird');
var WeChatAPI = require('wechat-api');
var UUID = require('node-uuid');
var XLSX = require('xlsx');
var router = require('express').Router();
var Device = require('mongoose').model('Device');
var Batch = require('mongoose').model('Batch');
var model = require('mongoose').model('Model');
var flowerServices = require('./flower/FlowerService.js')
var wechat = new WeChatAPI(nconf.get('wechat:appId'), nconf.get('wechat:appSecret'));
var _accessToken = '';
var batchState = [
    {val: -1, msg: '作废'},
    {val: 0, msg: '新建'},
    {val: 1, msg: '已完成'},
    {val: 2, msg: '已上传阿里云设备Id'},
    {val: 3, msg: '已完成macId导入'},
    {val: 4, msg: '已完成微信设备Id导入'}
];

function mongoIdToWebId(entity) {
    var o = entity.toObject();
    o.id = o._id.toString();
    delete o._id;
    return o;
}

function generateBBCloudId() {
    var manufacturerCode = 'AAA',
        toyCode = 'BBBBBB',
        uuid = UUID(),
        year = new Date().getFullYear().toString().substring(2, 4);

    return manufacturerCode + toyCode + year + uuid;
}

function saveMultiRecords(devices) {
    var len = devices.length;
    var perSaveNum = 10;
    var times = Math.ceil(len / perSaveNum);
    var start = 0, end = 0;
    for (var i = 0; i < times; i++) {
        start = perSaveNum * i;
        end = (start + perSaveNum) > len ? len : (start + perSaveNum);
        var toSaveDevices = devices.slice(start, end)
        Device.insertMany(toSaveDevices)
    }
}

function promiseSequentialize(promiseFactories) {
    var chain = Promise.resolve();
    promiseFactories.forEach(function (promiseFactory) {
        chain = chain.then(promiseFactory);
    });
    return chain;
}
function httpRequestWechatIds(data) {
    return new Promise(function (resolve, reject) {
        //Todo 前端输入产品号
        var url = 'https://api.weixin.qq.com/device/getqrcode?access_token=' + _accessToken + '&product_id=11388';
        request.get(url, function (err, response, body) {
            if (err) {
                // reject('get wechat deviceid err')
                console.log(err);
            }
            if (!data) {
                data = new Array();
            }
            body = JSON.parse(body);
            if (!body.deviceid) {
                reject(body)
            }
            var newData = {wechatId: body.deviceid, qrticket: body.qrticket};
            data.push(newData);
            resolve(data);
        })
    })
}

exports.reqesutWechatDeviceIds = function (req, res, next) {
    //获取accessToken
    wechat.getAccessToken(function (err, token) {
        if (err) {
            console.log('请求微信accessToken错误', err);
            res.json({code: 500, msg: '请求微信accessToken错误'})
        } else {
            _accessToken = token.accessToken;

            //请求微信硬件设备Id
            var wechatRequestArray = [];
            //请求设备号
            for (var i = 0; i < req.deviceQuantity; i++) {
                wechatRequestArray.push(httpRequestWechatIds)
            }

            promiseSequentialize(wechatRequestArray).then(function (data) {
                if (data.errcode) {
                    return next({code: 400, msg: 'request wechat device id failure.'})
                }
                req.wechatIds = data;
                next();
            }).catch((err)=> {
                return next({code: 400, msg: err})
            })
        }
    })
}

exports.generateWechatDeviceIds = function (req, res, next) {
    //save wecaht device Ids
    var wechatIds = req.wechatIds;
    var batchId = req.body.batchId;
    console.log('in generateWechatDeviceIds,wechatIds:', wechatIds);
    //find all records by batchId
    Device.find({batchId: batchId}).then(function (data) {
        if (!data) {
            return next({code: 400, msg: 'devices not found'})
        }
        if (data.length !== wechatIds.length) {
            return next({code: 400, msg: 'wechatIds count is not matched with batch count.'})
        }
        new Promise(function (resolve, reject) {
            data.forEach(function (item, index) {
                var deviceData = {
                    wechatDeviceId: wechatIds[index].wechatId,
                    wechatDeviceQrticket: wechatIds[index].qrticket
                }
                Device.findByIdAndUpdate(item._id, deviceData).then(function (entity) {

                });
            })
            //upload batch state
            Batch.findByIdAndUpdate(batchId, {status: batchState[5].val}).then(()=> {
            })
            resolve();
        })
            .then(function () {
                return new Promise(function (resolve, reject) {
                    //利用deviceid更新设备属性
                    //https://api.weixin.qq.com/device/authorize_device?access_token=ACCESS_TOKEN
                    var device_list = [];
                    wechatIds.forEach(function (item, index) {
                        console.log('data[index].macAddress:::', data[index].macAddress);
                        var itemData = {
                            "id": item.wechatId,
                            "mac": data[index].macAddress,
                            "connect_protocol": "3|4",
                            "auth_key": "1234567890ABCDEF1234567890ABCDEF",
                            "close_strategy": "1",
                            "conn_strategy": "1",
                            "crypt_method": "0",
                            "auth_ver": "1",
                            "manu_mac_pos": "-1",
                            "ser_mac_pos": "-2",
                            "ble_simple_protocol": "0"
                        }
                        device_list.push(itemData);
                    })
                    var wechatOptions = {
                        "device_num": wechatIds.length + '',
                        "device_list": device_list,
                        "op_type": "1"
                    }
                    var reqOption = {
                        url: "https://api.weixin.qq.com/device/authorize_device?access_token=" + _accessToken,
                        body: wechatOptions,
                        json: true
                    }
                    console.log('reqOption', reqOption);
                    request.post(reqOption, (err, response, body)=> {
                        console.log(body);
                        resolve();
                    })
                })
            })
            .then(function () {
                res.json({code: 200, msg: 'ok'})
            })
    })
}

exports.checkBatchState = function (req, res, next) {
    if (!req.body.batchId) {
        next();
    } else {
        Batch.findById(req.body.batchId).populate({
            path: 'manufacturer',
            select: '_id'
        }).then(function (entity) {
            if (entity) {
                req.manufacturerId = entity.manufacturer._id;
                req.deviceQuantity = entity.quantity;
                if (entity.status == 1 || entity.status == 4) {
                    res.json({code: 400, msg: 'batch is successful and can not be modified.'})
                } else if (entity.status == -1) {
                    res.json({code: 400, msg: 'batch had been deleted'})
                } else {
                    next();
                }
            } else {
                res.json({code: 400, msg: 'manufacturer not found'})
            }
        })
    }
}
exports.parseAliIds_Json = function (req, res, next) {
    if (req.user.realm === 'administrator') {
        var filePath = req.body.files.file.path;
        if (filePath) {
            fs.readFile(filePath, {encoding: 'utf-8'}, function (err, bytesRead) {
                if (err) {
                    next(err);
                }
                req.aliIds = JSON.parse(bytesRead);
                next()
            });
        } else {
            res.json({code: 400, msg: 'filePath is required'})
        }
    } else {
        res.json({code: 400, msg: 'no auth to operate'})
    }
}

exports.uploadAliIds = function (req, res, next) {
    if (req.user.realm !== 'administrator') {
        return next({code: 400, msg: 'no auth to operate'})
    }
    if (!req.body.files) {
        if (!req.files) {
            return next({code: 400, msg: 'file is required'})
        }
        req.body.files = req.files;
    }
    // console.log('req.files.file:',req.files.file);
    var filePath = req.body.files.file.path || req.files.file.path;
    if (!filePath) {
        next({code: 400, msg: 'filePath is required'});
    }

    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, bytesRead) {
        if (err) {
            return next({code: 400, msg: err.message});
        }
        var aliIds = [];
        try {
            aliIds = JSON.parse(bytesRead) || [];
        } catch (e) {
            return next({code: 400, msg: e.message});
        }
        var batchId = req.body.batchId;
        if (!batchId) {
            return next({code: 400, msg: 'batchId is required'})
        }
        //find all records by batchId
        Device.find({batchId: batchId}).then(function (data) {
            if (data.length === aliIds.length) {
                Promise.resolve().then(function () {
                    data.forEach(function (item, index) {
                        var deviceData = {
                            _id: item._id,
                            aliyunDeviceId: aliIds[index].device_id,
                            aliyunDeviceSecret: aliIds[index].device_secret
                        }
                        Device.findByIdAndUpdate(item._id, deviceData).then(function (entity) {

                        });
                    })
                    //upload batch state
                    Batch.findByIdAndUpdate(batchId, {status: batchState[3].val}).then(()=> {
                    })
                }).then(function () {
                    res.json({code: 200, msg: 'ok'})
                })
            } else {
                next({code: 400, msg: 'aliIds count is not matched with batch count.'})
            }
        })
    })
}

exports.parseMacIds_XLSX = function (req, res, next) {
    if (req.user.realm !== 'administrator') {
        return next({code: 400, msg: 'no auth to operate'})
    }
    if (!req.body.files) {
        if (!req.files) {
            return next({code: 400, msg: 'file is required'})
        }
        req.body.files = req.files;
    }
    // console.log('req.files.file:',req.files.file);
    var filePath = req.body.files.file.path || req.files.file.path;
    if (!filePath) {
        return next({code: 400, msg: 'filePath is required'});
    }

    var workbook;
    try {
        workbook = XLSX.readFile(filePath);
    } catch (e) {
        return next({code: 400, msg: e})
    }
    /* DO SOMETHING WITH workbook HERE */
    var sheet_name_list = workbook.SheetNames;
    var tempRows = [];
    var isContentNullorEmpty = false;
    sheet_name_list.forEach(function (y) { /* iterate through sheets */
        var worksheet = workbook.Sheets[y];
        //colIndex用于记数，只取两列数据
        var colIndex = 0;
        var tempRow = {};
        for (z in worksheet) {
            /* all keys that do not begin with "!" correspond to cell addresses */
            if (z[0] === '!') continue;
            var rowRex = /[A,B,a,b](\d+)/;
            if (rowRex.test(z) && RegExp.$1 > 1) {
                if (colIndex == 0) {
                    if (!worksheet[z].v) {
                        isContentNullorEmpty = true;
                        break;
                    }
                    tempRow['macId'] = worksheet[z].v;
                    colIndex++;
                } else {
                    tempRow['macData'] = worksheet[z].v;
                    tempRows.push(tempRow);
                    colIndex = 0, tempRow = {};
                }
            } else {
                continue;
            }
        }
    })
    if (tempRows.length == 0) {
        return next({code: 400, msg: 'file content is empty'});
    }
    if (isContentNullorEmpty) {
        return next({code: 400, msg: 'some mac id is lacked'});
    }
    req.macIds = tempRows;
    next();

}

exports.uploadMacIds = function (req, res, next) {
    var macIds = req.macIds;
    var batchId = req.body.batchId;
    const iot = require('../services/aliyun/iot');

    //find all records by batchId
    Device.find({batchId: batchId}).then(function (data) {
        if (!data) {
            return next({code: 400, msg: 'devices not found'})
        }
        if (data.length !== macIds.length) {
            return next({code: 400, msg: 'macIds count is not matched with batch count.'})
        }
        return new Promise(function (resolve, reject) {
            data.forEach(function (item, index) {
                var deviceData = {
                    _id: item._id,
                    macAddress: macIds[index].macId,
                }
                Device.findByIdAndUpdate(item._id, deviceData).then(function (entity) {
                    //set ali iot device auth 无法确保所有设备已正确授权，待处理
                    iot.deviceGrant({
                        DeviceId: entity.aliyunDeviceId,
                        GrantType: 'ALL',
                        MacAddress: macIds[index].macId,
                    }, (err, res) => {
                        console.log('result from ali iot:');
                        console.log(res);
                    });
                });
            })
            //upload batch state
            Batch.findByIdAndUpdate(batchId, {status: batchState[4].val}).then(()=> {
                resolve()
            })
        }).then(function () {
            res.json({code: 200, msg: 'ok'})
        })
    })
}


exports.generateBBCloudIds = function (req, res) {
    var batchId = req.body.batchId;
    var manufacturerId = req.manufacturerId;
    Batch.findById({_id: batchId}).then(function (data) {
        if (data) {
            var devicesArray = new Array(data.quantity)
            for (var i = 0; i < data.quantity; i++) {
                var bbId = generateBBCloudId();
                var deviceData = {
                    batchId: batchId,
                    bbcloudDeviceId: bbId,
                    manufacturerId: manufacturerId
                }
                devicesArray.push(new Device(deviceData));
            }
            //save many once
            saveMultiRecords(devicesArray);
            //upload batch state
            Batch.findByIdAndUpdate(batchId, {status: batchState[1].val}).then(()=> {
                res.json({code: 200, msg: 'ok'})
            })
        } else {
            res.json({err: 400, msg: 'batch not found'})
        }

    }).catch(function (err) {
        console.log(err);
        res.json({code: 500, msg: 'err'})
    })
}

exports.invalidBatch = function (req, res, next) {
    //delete devices
    console.log('delete');
    var batchId = req.body.batchId;
    var reason = req.body.reason || '未填写';
    //find all records by batchId
    Device.find({batchId: batchId}).then(function (data) {
        if (!data) {
            res.json({code: 400, msg: 'devices not found'})
        }
        Promise.resolve().then(function () {
            data.forEach(function (item, index) {
                Device.findByIdAndRemove(item._id).then(function (entity) {
                    console.log('has deleted:', item._id);
                }).catch(function (err) {
                    console.log(err);
                });
            })
            //upload batch state
            Batch.findByIdAndUpdate(batchId, {status: batchState[0].val, note: reason}).then(()=> {
            })
        }).then(function () {
            res.json({code: 200, msg: 'ok'})
        })
    })
}

exports.createDevices = function (req, res, next) {
    var data = req.body;
    var deviceModel;
    var devicesArray = [];
    Promise.resolve()
        .then(function () {
            return model.findById(data.model).then(function (result) {
                console.log('data.model', result);
                deviceModel = result;
                return result;
            });
        })
        .then(function () {
            var entity = new Batch(data);
            console.log('entity', entity);
            return entity.save().then(function (result) {
                console.log('result', result);
                return result;
            })
        })
        .then(function (deviceBatch) {
            for (var i = 0; i < deviceBatch.quantity; i++) {
                var bbId = generateBBCloudId();
                var devicesData = {
                    bbcloudDeviceId: bbId,
                    name: deviceModel.name,
                    deviceModelName: deviceModel.name,
                    manufacturerId: data.manufacturer,
                    batchId: deviceBatch._id,
                    icon: deviceModel.icon,
                    socialAccount: '0' + bbId,
                    socialPassword: bbId
                }
                var tempmodel = new Device(devicesData)
                devicesArray.push(tempmodel);
            }
            saveMultiRecords(devicesArray);
            // devicesArray.forEach(function(item, index){
            //   var entity = new Device(item);
            //   entity.save(function(err){
            //     console.log(err);
            //   });
            // });
            res.json(mongoIdToWebId(deviceBatch));
        }).catch(next);
}

exports.getDeviceInfo = function (req, res) {
    var macAddress = req.body.macAddress;
    Device.findOne({macAddress: macAddress}, function (err, device) {
        if (err) return res.json({code: 500, msg: err});
        if (!device) return res.json({code: 400, msg: 'devices not found'});
        var data = _.pick(device, 'bbcloudDeviceId', 'wechatDeviceId', 'aliyunDeviceId', 'aliyunDeviceSecret');
        res.json(data);
    });
}

exports.addFlowerSignIn = function (req, res, next) {
    var dataStr = req.query.data;

    // var data = {
    //    "status": "online",
    //    "appId": "12231",
    //    "deviceSn": "sss",
    //    "deviceId": "grouptest1",
    //    "time": "2015-12-23 00:00:00"
    // }
        data = JSON.parse(dataStr);
        if (data.status === 'online') {
            Device.findOne({name: data.deviceId}, function (err, dev) {
                if (err) {
                    return next(err);
                }
                flowerServices.addFlower(dev.macAddress, 'signIn').then(function (data) {
                    res.send(data);
                    //next();
                }).catch(function (e) {
                    next(e);
                })
            })

        }
}

exports.checkFlowers = function (req,res,next) {
    var macAddress = req.params.macAddress;
    flowerServices.checkFlowers(macAddress).then(function (data) {
        data.detail = undefined;
        res.json(data);
    })
}