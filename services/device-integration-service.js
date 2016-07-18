var mongoose = require('mongoose');
var Analytic = mongoose.model('Analytic');
var Device = mongoose.model('Device');
var DeviceAppConfiguration = mongoose.model('DeviceAppConfiguration');
var CommonAppConfiguration = mongoose.model('CommonAppConfiguration');
var _  = require('lodash');
var Promise = require('bluebird');
var iot = require('./aliyun/iot');
var debug = require('debug')('bbCloud:device-integration');

//上报事件
exports.analytics = function(req, res){
    if(!Array.isArray(req.body)){
        return res.json({code: 500, msg: 'request fail'});
    }
    var eventArray = req.body;
    var ip = req.ip;
    var msg = [];
    var time = Date.now();
    eventArray.forEach(function(item, index){
        msg.push(item.eventId);
        if(item.event === 'device-activated'){
            deviceActivated(item.data.macAddress, time);
        }
        var event = {
            eventId: item.eventId,
            event: item.event,
            data: item.data,
            metadata: {
                time: time,
                ip: ip
            }
        };
        var entity = new Analytic(event);
        entity.save();
    });
    res.json(msg);
};

//交换信息
exports.getDeviceInfo = function (req, res){
    if(!req.body.macAddress){
        return res.json({code:400,msg:'devices not found'});
    }
    var macAddress = req.body.macAddress;
    Device.findOne({macAddress: macAddress}, function(err, device){
        if(err) return res.json({code:500, msg: err});
        if(!device) return res.json({code:400,msg:'devices not found'});
        var data = _.pick(device, 'bbcloudDeviceId', 'wechatDeviceId', 'aliyunDeviceId', 'aliyunDeviceSecret');
        res.json(data);
    });
};

//获取最新配置项或资源项
exports.getDeviceAppConfiguration = function (req, res) {
    // if(!req.query || !req.query.key){
    //     return res.json({code: 500, msg: 'request fail'});
    // }
    var key = req.query.key;
    var params = req.params;
    if(Array.isArray(key) && key.length !== 0){
        DeviceAppConfiguration.find({"macAddress": params.macAddress, "key": {"$in": key}}, '-_id key value').then(function(result){
            if(result.length === key.length){
                debug('get the device app configuration success');
                return res.json(result);
            }else {
                debug('get the device union common app configuration success');
                result.forEach(function(item, index){
                    _.pull(key, item.key);
                });
                CommonAppConfiguration.find({"key": {"$in": key}}, '-_id key value').then(function(common){
                   return res.json(_.union(result, common));
                });
            }
        }).catch(function(err){
            return res.json(err)
        });
    }else if(!key){
        DeviceAppConfiguration.find({"macAddress": params.macAddress}, '-_id key value').then(function(result){
                CommonAppConfiguration.find({}, '-_id key value').then(function(common){
                    debug('not key for get the every app configuration success');
                    //TODO 有更好的算法
                    result.forEach(function(item, index){
                        for(var i =0; i < common.length; i++){
                            if(item.key === common[i].key){
                                common.splice(i, 1);
                            }
                        }
                    });
                    var every = _.unionWith(result, common, _.isEqual);
                    return res.json(every);
                })
        });
    }else{
        DeviceAppConfiguration.find({"macAddress": params.macAddress, "key": key}, '-_id key value').then(function(result){
            if(result.length === 0){
                CommonAppConfiguration.find({"key": key}, '-_id key value').then(function(common){
                    debug('one key for get the common app configuration success');
                    return res.json(common);
                })
            }else{
                debug('one key for get the device app configuration success');
                return res.json(result);
            }
        });
    }
};

//同步配置(已废弃)
exports.deviceAppConfigurationSync = function(req, res){
    if(!Array.isArray(req.body)){
        return res.json({code: 500, msg: 'request fail'});
    }
    var configuration = req.body;
    var params = req.params;

    Promise.each(configuration, function(item, index, length){
        return DeviceAppConfiguration.findOne({"macAddress": params.macAddress, "key": item.key})
            .then(function(result){
                item.macAddress = params.macAddress;
                if(!result){
                    var entity = DeviceAppConfiguration(item);
                    entity.save();
                }else{
                    if(result.v < item.v){
                        result.v = item.v;
                        result.value = item.value;
                        result.save();
                    }else{
                        item.v = result.v;
                        item.value = result.value;
                    }
                }
            })
    }).then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json(err);
    });
};

// 配置变更通知
exports.pushDeviceAppConfiguration = function(macAddresses, keys){
    var data = {
        deviceTopic: 'apps_configuration/modify/request',
        payload: keys
    };
    macAddresses.forEach(function(item, index){
        iot.pub({MacAddress: item, MessageContent: data});
    });
};

//设备App设置更新服务
exports.upsertDeviceAppConfiguration = function(data){
    var where = {};
    where.key = data.key || '';
    where.macAddress = data.macAddress || '';
    DeviceAppConfiguration.findOne(where).then(function(config){
        if(!config){
            debug('save device app configuration for success:');
            var entity =DeviceAppConfiguration(data);
            entity.save();
        }else{
            debug('update device app configuration for success:');
            config.value = data.value;
            config.save();
        }
    }).catch(function(err){
        debug('upsert device app configuration for fail:');
        throw err;
    });
};

//通用App设置更新服务
exports.upsertCommonAppConfiguration = function(data){
    var where = {};
    where.key = data.key || '';
    CommonAppConfiguration.findOne(where).then(function(config){
        if(!config){
            debug('save common app configuration for success:');
            var entity =CommonAppConfiguration(data);
            entity.save();
        }else{
            debug('update common app configuration for success:');
            config.value = data.value;
            config.save();
        }
    }).catch(function(err){
        debug('upsert common app configuration for fail:');
        throw err;
    });
};

//更新设备激活时间
function deviceActivated(mac, time){
    Device.findOne({macAddress: mac}).then(function(device){
        device.activatedAt = time;
        device.save();
    });
}