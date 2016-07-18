/**
 * Created by JeremyNg on 16/7/5.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowerCateSchema = new Schema({
    name: {type: String, unique: true},
    code: {type: String, unique: true}
});

module.exports = mongoose.model('FlowerAwardCategory', FlowerCateSchema);