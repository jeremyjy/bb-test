/**
 * Created by JeremyNg on 16/6/20.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voiceServiceSchema = new Schema({
// _id	ObjectId	设备唯一id，自动生成	pk
    erviceCode:Srting,
    serviceName:{
        providerName:String,
        providerUrl:String
    },
    pingRespTime:String,
    pingCheckTime:String

});

module.exports = mongoose.model('VoiceService',voiceServiceSchema);

