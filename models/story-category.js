var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var storyCategorySchema = new Schema({
  name: {type: String, required: true, unique: true}, //故事分类名称
  iconFileName: String, //故事分类图标，OSS文件名
  description: {type: String}, //故事分类描述
  createdAt: {type: Date, default: Date.now},
  order: {type: Number, default:100}
});

module.exports = mongoose.model('StoryCategory', storyCategorySchema);
