var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowerActSchema = new Schema({
    deviceId: {type: Schema.Types.ObjectId, ref: 'Device'},
    rule:{type: Schema.Types.ObjectId, ref: 'FlowerAwardRule'},
    flowerAwardDate: String,
    flowers: Number
});

module.exports = mongoose.model('FlowerAwardActivity', FlowerActSchema);
