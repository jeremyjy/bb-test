var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var manufacturerTypeSchema = new Schema({
  name: {type: String, required: true, unique: true},
  code: {type: Number, required: true},
});


module.exports = mongoose.model('ManufacturerType', manufacturerTypeSchema);
