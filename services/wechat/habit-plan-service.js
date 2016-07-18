var mongoose = require('mongoose');
var HabitPlan = mongoose.model('HabitPlan');
var HabitMusic = mongoose.model('HabitMusic');
var CustomerAccount = mongoose.model('CustomerAccount');
var Promise = require('bluebird');
var debug = require('debug')('bbCloud:habit-plan');
var _ = require('lodash');

exports.getHabitPlan = function(req, res){
    debug('Get the habit plan:');
    //TODO 暂时写死
    var wechatOpenId = 'oza3XwWY50x-6r-qW0DAcIqmtuQA';
    var list = [];
    CustomerAccount.findOne({wechatOpenId: wechatOpenId}).then(function(customer){
        if(customer && customer.deviceId.length !== 0){
            HabitPlan.find({owner: {"$in": customer.deviceId}}).then(function(plan){
                plan.forEach(function(item, index){
                    HabitMusic.findById(item.musicId).then(function(music){
                        //TODO
                        var i = {};
                        i.number = index + 1;
                        i.fileName = music.fileName || null;
                        i.musicName = music.fileName.split('.')[0] || '无';
                        i.id = item._id;
                        i.name = item.name;
                        i.fromTime = item.fromTime;
                        i.endTime = item.endTime;
                        i.monday = item.monday;
                        i.tuesday = item.tuesday;
                        i.wednesday = item.wednesday;
                        i.thursday = item.thursday;
                        i.friday = item.friday;
                        i.saturday = item.saturday;
                        i.sunday = item.sunday;
                        list.push(i);
                        // list.push(_.defaults(i, item));
                        if(list.length === plan.length){
                            res.json(list);
                        }
                    });
                });
            });
        }else{
            res.json({code: 400, msg: 'account not has the device'});
        }
    });
};

exports.createHabitPlan = function(req, res){
    debug('Create the habit plan:');
    var body = req.body;
    var music = {
        fileName: body.musicName,
        downloaded: false,
        nonce: ''
    }
    var entity = HabitMusic(music);
    entity.save(function(err, result){
        console.log(err);
        console.log(res);
        res.end();
    });
};

exports.deleteHabitPlan = function (req, res) {
    debug('delete the habit plan:');
    var id = req.query.id || '';
    HabitPlan.remove({_id: id}).then(function(res){
        console.log(res.result);
        return res.json(res);
    }).catch(function(err){
        return res.json(err);
    });
};