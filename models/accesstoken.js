var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accessTokenSchema = new Schema({
  type: String,
  token: Object,
  updateAt: {type:Date,default:new Date()}
});

var AccessToken = mongoose.model('AccessToken', accessTokenSchema);

module.exports = AccessToken;
