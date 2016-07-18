var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SendEmailSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'ManufacturerAccount' },
    type: String,//active,resetPwd
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SendEmail', SendEmailSchema);
