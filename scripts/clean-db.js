#!/usr/bin/env node

require('../nconf');
require('../mongoose');

var mongoose = require('mongoose');

Promise.all(mongoose.modelNames().map(function (modelName) {
  return mongoose.model(modelName).remove();
})).then(function () {
  console.log('clean done');
  process.exit(0);
});
