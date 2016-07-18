var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StoryOperationHistorySchema = new Schema({
  story: {type: Schema.Types.ObjectId, ref: 'Story'}, // 故事
  operatedBy: {type: Schema.Types.ObjectId, ref: 'CustomerAccount'}, // 操作人
  sendTo: {type: Schema.Types.ObjectId, ref: 'Device'}, // 推送到哪个设备
  createdAt: {type: Date, default: Date.now},
  opType: Number, // 操作类型：1-试听；2-点播；3-推送
  introduction: String, // 引子OSS文件名
  questions: String // 问题OSS文件名
});

module.exports = mongoose.model('StoryOperationHistory', StoryOperationHistorySchema);
