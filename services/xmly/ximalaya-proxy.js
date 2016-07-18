'use strict';
const Ximalaya = require('./sdk');
const config = require('./config');
const getmac = require('getmac');

const xmly = new Ximalaya(config);

module.exports = xmly;
