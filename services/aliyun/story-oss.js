'use strict';

const baseOSS = require('./base-oss');
const bucket = require('./aliyun-config').oss.storyBucket;

module.exports = baseOSS(bucket);
