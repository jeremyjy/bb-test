var mongoose = require('mongoose');
var Promise = require('bluebird');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var administratorAccountSchema = new Schema({
  name: {type: String, required: true, unique: true},
  hash: {type: String, required: true},
  salt: {type: String, required: true},
  role: {type: Schema.Types.ObjectId, ref: 'Role'},
  createdAt: {type: Date, default: Date.now},
  updatedAt: Date,
  deletedAt: Date
});

administratorAccountSchema.plugin(passportLocalMongoose, {
  usernameField: 'name',
  saltField: 'salt',
  hashField: 'hash'
});

var AdministratorAccount = mongoose.model('AdministratorAccount', administratorAccountSchema);

// promisify
AdministratorAccount.register = Promise.promisify(AdministratorAccount.register, {context: AdministratorAccount});
AdministratorAccount.prototype.setPassword = Promise.promisify(AdministratorAccount.prototype.setPassword);

module.exports = AdministratorAccount;
