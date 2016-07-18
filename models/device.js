var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
  // _id	ObjectId	设备唯一id，自动生成	pk
  serialNumber:{type: String, sparse:true, unique: true,  trim: true},  //设备生产的序列号	unique,
  macAddress:{type: String, sparse:true, unique: true} ,  //设备的 MAC 地址	unique
  name:String,  //设备型号显示名称
  totalFlowers:Number,
  deviceModelName:String, //模型名
  icon: String, //设备头像
  bbcloudDeviceId:{type: String, sparse:true, unique: true} ,  //bbcloud 的设备 id，由规则生成	unique, index
  wechatDeviceId:{type: String, sparse:true, unique: true} ,  //微信硬件平台分配的设备 id	unique
  wechatDeviceQrticket:String,  //设备二维码生产串
  wechatDeviceLicence:String, //产品使用直连SDK时返回的设备证书
  aliyunDeviceId:{type: String, sparse:true, unique: true} ,  //阿里云 IoT 服务分配的设备 id	unique
  aliyunDeviceSecret:String,
  lastLoginIp:String,  //最近访问 bbcloud 的 ip
  lastLoginAt:Date,  //最近访问 bbcloud 的时间
  activatedAt: Date, //激活时间
  manufacturerId:String,  //厂商Id ,指向 Manufacturer
  batchId:String,  //批次Id
  socialAccount:String, //	社交帐号：以0 开头
  socialPassword:String, //社交帐号密码
  friends: {type: Array, default: []}
});


var Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
