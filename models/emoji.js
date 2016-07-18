var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emojiSchema = new Schema({
    name: {type: String,  sparse:true, unique: true},
    iconFileName: {type: String},
    voiceFileName: {type: String},
    iconFileUrl: {type: String},
    voiceFileUrl: {type: String}
});

module.exports = mongoose.model('Emoji', emojiSchema);

