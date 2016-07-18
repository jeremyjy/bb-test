'use strict';

require('../nconf');
require('../mongoose');
var mongoose = require('mongoose');
var Promise = require('bluebird');

var AdministratorAccount = mongoose.model('AdministratorAccount');
var Permission = mongoose.model('Permission');
var Role = mongoose.model('Role');

const request = require('request');
const expect = require('chai').expect;
const url = require('url');
const fs = require('fs');
const baseUrl = 'http://127.0.0.1:3000';
const baseAuthPrefix = baseUrl + '/api/auth';
const Authorization = 'Bearer ';
const userName = 'admin';
const password = 'admin';

let token = '';
let tempRole;
let storyCategory;
let story;

function initAdmin(done) {
  var administratorName = userName;

  var roleName = '超级管理员';

  var permissions = [
    { name: '查询权限列表', code: 'permissions:read' },
    { name: '删除权限', code: 'permissions:delete' },
    { name: '新建权限', code: 'permissions:create' },
    { name: '修改权限', code: 'permissions:update' },

    { name: '查询角色列表', code: 'roles:read' },
    { name: '删除角色', code: 'roles:delete' },
    { name: '新建角色', code: 'roles:create' },
    { name: '修改角色', code: 'roles:update' },

    { name: '查询管理员列表', code: 'administrator-accounts:read' },
    { name: '删除管理员', code: 'administrator-accounts:delete' },
    { name: '新建管理员', code: 'administrator-accounts:create' },
    { name: '修改管理员', code: 'administrator-accounts:update' },


    //内容权限
    // { name: '新建故事分类', code: 'story-categories:create' },
    // { name: '查看故事分类', code: 'story-categories:read' },
    // { name: '更新故事分类', code: 'story-categories:update' },
    // { name: '删除故事分类', code: 'story-categories:delete' },
    //
    // { name: '新建故事', code: 'stories:create' },
    // { name: '查看故事', code: 'stories:read' },
    // { name: '更新故事', code: 'stories:update' },
    // { name: '删除故事', code: 'stories:delete' },

  ];

  Promise.all(mongoose.modelNames().map(function (modelName) {
    return mongoose.model(modelName).remove();
  }))
  .then(function () {
    return Promise.all([
      AdministratorAccount.register(new AdministratorAccount({ name: administratorName }), password),
      new Role({ name: roleName }).save(),
      Promise.all(permissions.map(function (permissionData) {
        return new Permission(permissionData).save();
      }))
    ])
    .spread(function (administrator, role, permissions) {
      administrator.role = role;
      role.permissions = permissions;
      tempRole = role;
      return Promise.all([
        administrator.save(),
        role.save()
      ]);
    })
  })
  .then(function () {
    done();
  });
}

function addPermissions(ps){
  return new Promise(function (resolve,reject) {
    //add permissions to db
    ps.map(function (psItem,index) {
      new Permission(psItem).save(function (err,data) {
        tempRole.permissions.push(data)
        tempRole.save()
        if (index == ps.length-1) {
          resolve()
        }
      })
    })

  })
}

//管理员登录
function login() {
  return new Promise(function (resolve,reject) {
    let option = {
        url: url.resolve(baseUrl, "/administrator/auth/login"),
        body: {
            name: userName,
            password: password
        },
        json: true
    };
    request.post(option, (err, res, body) => {
        token = body.token;
        resolve(res)
    });
  })
}

describe('云端故事功能',()=>{

  describe('管理员相关权限测试验证',()=>{
    it('初始化管理员',done=>{
      initAdmin(function () {
        done();
      })
    })

    it('管理员账号登录',done=>{
      login().then(function (res) {
        expect(res.statusCode).to.be.equal(200);
        expect(token.split('.').length).to.be.equal(3);
        done();
      })
    })
    describe('新增故事分类',()=>{
      it('无权限',done=>{
        let option = {
            url: baseAuthPrefix + "/story-categories",
            body: {
                name: '分类一',
                description: '分类一测试'
            },
            headers:{
              'Authorization':Authorization + token
            },
            json: true
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(403);
            done();
        });
      })
      it('有权限',done=>{
        addPermissions([
          { name: '新建故事分类', code: 'story-categories:create' },
        ])
        .then(function () {
          //重新登录
          return login()
        })
        .then(function () {
          let option = {
              url: baseAuthPrefix + "/story-categories",
              body: {
                  name: '分类一',
                  description: '分类一测试'
              },
              headers:{
                'Authorization':Authorization + token
              },
              json: true
          };
          request.post(option, (err, res, body) => {
              storyCategory = body;
              expect(err).to.be.equal(null);
              expect(res.statusCode).to.be.equal(200);
              done();
          });
        })
      })
    })
    describe('查看故事分类',()=>{
      it('无权限',done=>{
        let option = {
            url: baseAuthPrefix + "/story-categories",
            headers:{
              'Authorization':Authorization + token
            },
            json: true
        };
        request.get(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(403);
            done();
        });
      })
      it('有权限',done=>{
        addPermissions([
          { name: '查看故事分类', code: 'story-categories:read' }
        ])
        .then(function () {
          //重新登录
          return login()
        })
        .then(function () {
          let option = {
              url: baseAuthPrefix + "/story-categories",
              headers:{
                'Authorization':Authorization + token
              },
              json: true
          };
          request.get(option, (err, res, body) => {
              expect(err).to.be.equal(null);
              expect(res.statusCode).to.be.equal(200);
              done();
          });
        })
      })
    })
    describe('更新故事分类',()=>{
      it('无权限',done=>{
        let option = {
            url: baseAuthPrefix + "/story-categories/"+storyCategory.id,
            body: {
                id: storyCategory.id,
                name: '从分类一变成分类二',
                description: '更新测试'
            },
            headers:{
              'Authorization':Authorization + token
            },
            json: true
        };
        request.put(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(403);
            done();
        });
      })
      it('有权限',done=>{
        addPermissions([
          { name: '更新故事分类', code: 'story-categories:update' }
        ])
        .then(function () {
          //重新登录
          return login()
        })
        .then(function () {
          let option = {
              url: baseAuthPrefix + "/story-categories/"+storyCategory.id,
              body: {
                  id: storyCategory.id,
                  name: '从分类一变成分类二',
                  description: '更新测试'
              },
              headers:{
                'Authorization':Authorization + token
              },
              json: true
          };
          request.put(option, (err, res, body) => {
              expect(err).to.be.equal(null);
              expect(res.statusCode).to.be.equal(200);
              done();
          });
        })
      })
    })
    describe('新增故事',()=>{
      it('无权限',done=>{
        let option = {
            url: baseAuthPrefix + "/stories",
            body: {
                name: '一故事',
                description: '一故事测试'
            },
            headers:{
              'Authorization':Authorization + token
            },
            json: true
        };
        request.post(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(403);
            done();
        });
      })
      it('有权限',done=>{
        addPermissions([
          { name: '新建故事', code: 'stories:create' },
        ])
        .then(function () {
          //重新登录
          return login()
        })
        .then(function () {
          let option = {
              url: baseAuthPrefix + "/stories",
              body: {
                  name: '一故事',
                  description: '一故事测试'
              },
              headers:{
                'Authorization':Authorization + token
              },
              json: true
          };
          request.post(option, (err, res, body) => {
              story = body;
              expect(err).to.be.equal(null);
              expect(res.statusCode).to.be.equal(200);
              done();
          });
        })
      })
    })
    describe('查看故事',()=>{
      it('无权限',done=>{
        let option = {
            url: baseAuthPrefix + "/stories",
            headers:{
              'Authorization':Authorization + token
            },
            json: true
        };
        request.get(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(403);
            done();
        });
      })
      it('有权限',done=>{
        addPermissions([
          { name: '查看故事', code: 'stories:read' }
        ])
        .then(function () {
          //重新登录
          return login()
        })
        .then(function () {
          let option = {
              url: baseAuthPrefix + "/stories",
              headers:{
                'Authorization':Authorization + token
              },
              json: true
          };
          request.get(option, (err, res, body) => {
              expect(err).to.be.equal(null);
              expect(res.statusCode).to.be.equal(200);
              done();
          });
        })
      })
    })
    describe('更新故事',()=>{
      it('无权限',done=>{
        let option = {
            url: baseAuthPrefix + "/stories/"+story.id,
            body: {
                id: story.id,
                name: '从一变成二',
                description: '更新测试'
            },
            headers:{
              'Authorization':Authorization + token
            },
            json: true
        };
        request.put(option, (err, res, body) => {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(403);
            done();
        });
      })
      it('有权限',done=>{
        addPermissions([
          { name: '更新故事', code: 'stories:update' }
        ])
        .then(function () {
          //重新登录
          return login()
        })
        .then(function () {
          let option = {
              url: baseAuthPrefix + "/stories/"+story.id,
              body: {
                  id: story.id,
                  name: '从一变成二',
                  description: '更新测试'
              },
              headers:{
                'Authorization':Authorization + token
              },
              json: true
          };
          request.put(option, (err, res, body) => {
              expect(err).to.be.equal(null);
              expect(res.statusCode).to.be.equal(200);
              done();
          });
        })
      })
    })

  })
})
