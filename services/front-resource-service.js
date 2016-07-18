'use strict';
const mongoose = require('mongoose');

module.exports = function(resource, model) {
  const router = require('express').Router();
  const Model = require('mongoose').model(model);

  router.get('/' + resource, query);

  router.get('/' + resource + '/:id', findById);

  return router;

  // 查询列表
  function query(req, res, next) {
    let page = req.query._page;
    let perPage = req.query._perPage;
    let sortField = req.query._sortField;
    let sortDir = req.query._sortDir;
    let filters = req.query._filters;

    let skip = parseInt((page - 1) * perPage);
    let limit = parseInt(perPage);
    let sort = {};
    try {
      sort[sortField] = sortDir.toLowerCase()
    } catch (err) {}
    try {
      filters = JSON.parse(req.query._filters)
      for (let k in filters) {
        if (typeof k === 'string' && filters[k].length !== 24) {
          filters[k] = new RegExp(filters[k]);//模糊查询参数
        }
      }
    } catch (err) {
      console.log('err:');
      console.log(err);
      filters = {}
    }
    Promise.all([
      Model.count(filters),
      Model.find(filters).limit(limit).skip(skip).sort(sort)
    ]).then(function(result) {
      res.header('X-Total-Count', result[0]);
      res.json(result[1].map(mongoIdToWebId));
    }).catch(next);
  }


  // 查找实例
  function findById(req, res, next) {
    let id = req.params.id;
    if (model === 'Story'){
      Model.findById(id).populate({path:'category',select:'name'}).then(function(entity) {
        if (!entity) throw new Error('not fount');
        res.json(mongoIdToWebId(entity));
      }).catch(next);
    }else{
      Model.findById(id).then(function(entity) {
        if (!entity) throw new Error('not fount');
        res.json(mongoIdToWebId(entity));
      }).catch(next);
    }
  }
}

// 将mongo对象转化为js对象
function mongoIdToWebId(entity) {
  let o = entity.toObject();
  o.id = o._id.toString();
  delete o._id;
  return o;
}
