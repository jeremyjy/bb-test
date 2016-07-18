var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var storySchema = new Schema({
  name: {type: String, required: true, unique: true}, //故事名称
  fileName: String, //故事文件名称：OSS文件名
  category: {type: Schema.Types.ObjectId, ref: 'StoryCategory'},
  createdAt: {type: Date, default: Date.now},
  fileSize: Number,
  duration: Number,
  description: String
});

module.exports = mongoose.model('Story', storySchema);
