var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StoryDownloadHistorySchema = new Schema({
  story: {type: Schema.Types.ObjectId, ref: 'Story'}, // 故事
  sendBy: {type: Schema.Types.ObjectId, ref: 'CustomerAccount'}, // 推送故事的人
  sendTo: {type: Schema.Types.ObjectId, ref: 'Device'}, // 推送到哪个设备
  createdAt: {type: Date, default: Date.now},
  status: Number, // 0-已推送；1-已下载；-1：已删除
});

module.exports = mongoose.model('StoryDownloadHistory', StoryDownloadHistorySchema);
