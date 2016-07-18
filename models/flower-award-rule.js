/**
 * Created by JeremyNg on 16/7/5.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowerRuleSchema = new Schema({
    categoryId: {type: Schema.Types.ObjectId, ref: 'FlowerAwardCategory'},
    behaviorName: {type:String,unique:true},
    behaviorCode: {type:String,unique:true},
    flowersOnce: Number,
    flowersLimit: Number
});

module.exports = mongoose.model('FlowerAwardRule', FlowerRuleSchema);