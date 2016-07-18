'use strict';

const baseOSS = require('./base-oss');
const bucket = require('./aliyun-config').oss.voiceChatBucket;

module.exports = baseOSS(bucket);