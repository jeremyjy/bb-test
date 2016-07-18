'use strict';

const baseOSS = require('./base-oss');
const bucket = require('./aliyun-config').oss.emojiBucket;

module.exports = baseOSS(bucket);
