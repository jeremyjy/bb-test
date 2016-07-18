var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var habitMusicSchema = new Schema({
    fileName: {type: String}, //阿里云OSS文件名
    downloaded: {type: String}, //标示是否已下载到设备：值为true/false
    nonce: {type: String} //随机数，用于校验
});

module.exports = mongoose.model('HabitMusic', habitMusicSchema);

