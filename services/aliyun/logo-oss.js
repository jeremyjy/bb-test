'use strict';

const baseOSS = require('./base-oss');
const bucket = require('./aliyun-config').oss.logoBucket;

module.exports = baseOSS(bucket);
