var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var manufacturerAccountSchema = new Schema({
  email: {type: String, required: true, unique: true},
  isMailBoxVerified:{type: Boolean},
  salt: {type: String, required: true},
  hash: {type: String, required: true},
  manufacturer: {type: Schema.Types.ObjectId, ref: 'Manufacturer'},
  status: {type: Number},
  auditedBy: {type: String},
  createdAt: {type: Date, default: Date.now}
});

manufacturerAccountSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

module.exports = mongoose.model('ManufacturerAccount', manufacturerAccountSchema);
