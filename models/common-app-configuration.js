var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commonAppConfigurationSchema = new Schema({
    key: {type: String, sparse:true, unique: true}, //配置项的key
    value: {type: String} //配置项的value
});


var CommonAppConfiguration = mongoose.model('CommonAppConfiguration', commonAppConfigurationSchema);

module.exports = CommonAppConfiguration;