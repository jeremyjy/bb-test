var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var habitPlanSchema = new Schema({
    name: {type: String, sparse:true, unique: true}, //习惯名称
    fromTime: {type: String}, //启动时间，格式为 - 时：分
    endTime: {type: String}, //结束时间，格式为 - 时：分
    monday: {type: Boolean}, //循环周期：周一， 值为true/false
    tuesday: {type: Boolean}, //循环周期：周二， 值为true/false
    wednesday: {type: Boolean}, //循环周期：周三， 值为true/false
    thursday: {type: Boolean}, //循环周期：周四， 值为true/false
    friday: {type: Boolean}, //循环周期：周五， 值为true/false
    saturday: {type: Boolean}, //循环周期：周六， 值为true/false
    sunday: {type: Boolean}, //循环周期：周日， 值为true/false
    musicId: {type: Schema.Types.ObjectId, ref: 'HabitMusic'}, //习惯计划音乐
    createdBy: {type: Schema.Types.ObjectId, ref: 'CustomerAccount'},
    owner: {type: Schema.Types.ObjectId, ref: 'Device'}
});

module.exports = mongoose.model('HabitPlan', habitPlanSchema);

