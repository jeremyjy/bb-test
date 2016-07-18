'use strict';
const ximalay = require('../xmly/ximalaya-proxy');

let stories = {};

stories.categories = function (req, res, next) {
  // var t = req.query.t;
  // var id = req.query.id;
  // var type = req.query.type;
  console.log(req.query);
  ximalay[req.query.t](req.query, (err, data) => {
    res.send(data)
  });
}
stories.category = function (req, res, next) {

}

stories.storyList = function (req, res, next) {

}
stories.recommendList = function (req, res, next) {

}

stories.detail = function (req, res, next) {

}

module.exports = stories;
