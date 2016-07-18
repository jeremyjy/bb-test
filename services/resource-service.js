'use strict';
const mongoose = require('mongoose');

module.exports = function(resource, model) {
  const router = require('express').Router();
  const Model = require('mongoose').model(model);

  router.get('/' + resource, permission(resource + ':read'), query);
  router.post('/' + resource, permission(resource + ':create'), create);

  router.get('/' + resource + '/:id', permission(resource + ':read'), findById);
  router.put('/' + resource + '/:id', permission(resource + ':update'), findByIdAndUpdate);
  router.delete('/' + resource + '/:id', permission(resource + ':delete'), findByIdAndRemove);

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

  // 创建实体的实例
  function create(req, res, next) {
    let data = req.body;
    let entity = new Model(data);
    entity.save().then(function() {
      res.json(mongoIdToWebId(entity));
    }).catch(next);
  }

  // 查找实例
  function findById(req, res, next) {
    let id = req.params.id;
    Model.findById(id).then(function(entity) {
      if (!entity) throw new Error('not fount');
      res.json(mongoIdToWebId(entity));
    }).catch(next);
  }

  // 更新实例
  function findByIdAndUpdate(req, res, next) {
    let id = req.params.id;
    let data = req.body;
    Model.findByIdAndUpdate(id, data).then(function(entity) {
      if (!entity) throw new Error('not fount');
      res.json(mongoIdToWebId(entity));
    }).catch(next);
  }

  // 删除实例
  function findByIdAndRemove(req, res, next) {
    let id = req.params.id;
    Model.findByIdAndRemove(id).then(function(entity) {
      if (!entity) throw new Error('not fount');
      res.json(mongoIdToWebId(entity));
    }).catch(next);
  }
};

// 将mongo对象转化为js对象
function mongoIdToWebId(entity) {
  let o = entity.toObject();
  o.id = o._id.toString();
  delete o._id;
  return o;
}

// 检查权限
function permission(permissionName) {
  return function(req, res, next) {
    if (req.user.realm === 'administrator') {
      let scope = req.user.scope;
      if (scope.indexOf(permissionName) === -1) {
        return res.sendStatus(403);
      } else if (permissionName.indexOf('update') !== -1 || permissionName.indexOf('delete') !== -1) {
        revokeToken(req.params.id);
      }
    }
    next();
  };
}

// 吊销Token，涉及到管理员的一些操作PUT和DELETE
function revokeToken(id) {
  console.log(id);
  let RevokeToken = mongoose.model('RevokeToken');
  return RevokeToken.update({
    uid: id,
    active: true
  }, {
    active: false
  }, {
    multi: true
  }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      return true;
    }
  });
}
