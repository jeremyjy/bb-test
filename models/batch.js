var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var batchSchema = new Schema({
  model: {type: Schema.Types.ObjectId, ref: 'Model', required: true},
  manufacturer: {type: Schema.Types.ObjectId, ref: 'Manufacturer', required: true},
  quantity: {type: Number, required: true},
  createdAt: {type: Date, default: Date.now},
  status: {type:Number, default:0},  //-1:作废; 0:新建;  1:完成; 2:已上传阿里云设备Id; 3:已完成微信设备Id导入 4:已完成macId导入
  note:String
});

module.exports = mongoose.model('Batch', batchSchema);
