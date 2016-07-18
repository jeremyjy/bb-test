/**
 * Created by JeremyNg on 16/6/21.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);


var GroupSchema = new Schema({
    number: Number,
    name: String,
    CreateBy: {type: Schema.Types.ObjectId, ref: 'CustomerAccount'},
    CreateTime: Date,
    members: {type: Array, default: []}

});


GroupSchema.plugin(autoIncrement.plugin, {model: 'Group', field: 'number', incrementBy: 1, startAt: 1});

module.exports = mongoose.model('Group', GroupSchema);