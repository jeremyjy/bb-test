var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var customerAccountSchema = new Schema({
  wechatOpenId: {type: String, sparse: true,unique: true},
  mobilePhoneNumber: {type: String, sparse: true,unique: true},
  salt: String,
  hash: String,
  name: String,
  icon:String,
  deviceId:[{type: Schema.Types.ObjectId,ref: 'Device'}],
  socialAccount:{type: String, unique: true, sparse: true},
  socialPassword:String,
  createdAt: {type: Date, default: Date.now}
});

customerAccountSchema.plugin(passportLocalMongoose, {
  usernameField: 'mobilePhoneNumber'
});

module.exports = mongoose.model('CustomerAccount', customerAccountSchema);
