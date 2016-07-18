var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var modelSchema = new Schema({
  name: {type: String, required: true},
  code: {type: String, required: true, unique: true},
  manufacturer: {type: Schema.Types.ObjectId, ref: 'Manufacturer', required: true},
  icon: String //设备头像
});

module.exports = mongoose.model('Model', modelSchema);
