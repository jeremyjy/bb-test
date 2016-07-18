/**
 * Created by JiamingLinn on 16-7-2.
 */

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GroupChatHistorySchema = new Schema({
  // groupId: Schema.Types.ObjectId,
  groupId: {type: Schema.Types.ObjectId, ref: 'Group'}, //
  from: {
    socialAccount: String,
    nickName: String
  },
  createdTime: {type: Date, default: Date.now},
  type: {type: String, default: '1'}, //type 1: voice message;
  content: String //the oss filename of voice if voice chat
});

module.exports = mongoose.model('GroupChatHistory', GroupChatHistorySchema);