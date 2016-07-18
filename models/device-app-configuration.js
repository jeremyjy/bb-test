var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deviceAppConfigurationSchema = new Schema({
    key: {type: String}, //配置项的key
    value: {type: String}, //配置项的value
    macAddress: {type: String} //mac地址
});


var DeviceAppConfiguration = mongoose.model('DeviceAppConfiguration', deviceAppConfigurationSchema);

module.exports = DeviceAppConfiguration;