'use strict';

require('../nconf');
require('../mongoose');
var mongoose = require('mongoose');
var Promise = require('bluebird');

var AdministratorAccount = mongoose.model('AdministratorAccount');
var ManufacturerAccount = mongoose.model('ManufacturerAccount');
var Manufacturer = mongoose.model('Manufacturer');
var Batch = mongoose.model('Batch');
var Model = mongoose.model('Model');
var Device = mongoose.model('Device');
var Permission = mongoose.model('Permission');
var Role = mongoose.model('Role');

const request = require('request');
const expect = require('chai').expect;
const url = require('url');
const fs = require('fs');
const baseUrl = 'http://127.0.0.1:3000';
const Authorization = 'Bearer ';
const userName = 'admin';
const manufacturerAccountName = 'czciou@qq.com'
const password = 'admin';

let token = '';
let emailToken = '',cszhToken='';
var batchId,csEntity,cszhEntity,modelEntity;

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

    { name: '查询消费者列表', code: 'customer-accounts:create' },
    { name: '删除消费者', code: 'customer-accounts:delete' },

    { name: '查询型号', code: 'models:read' },

    { name: '查询批次', code: 'batches:read' },
    // { name: '新建批次', code: 'batches:create' },
    // { name: '更新批次', code: 'batches:update' },
    { name: '查看厂商类型', code: 'manufacturer-types:read' },
    { name: '创建厂商类型', code: 'manufacturer-types:create' },
    { name: '更新厂商类型', code: 'manufacturer-types:update' },
    { name: '查询厂商', code: 'manufacturers:read' },
    { name: '更新厂商', code: 'manufacturers:update' },
    { name: '查询厂商账户', code: 'manufacturer-accounts:read' },
    { name: '更新厂商账户', code: 'manufacturers-accounts:update' },
    // { name: '作废批次', code: 'batches:delete' },
    { name: '作废批次', code: 'batches:invalidate' },

    // { name: '查询设备', code: 'devices:read' },
    // { name: '新建设备', code: 'devices:create' },
    // { name: '更新设备', code: 'devices:update' },
    { name: '设备阿里导入', code: 'devices:importAliyunDeviceIds' },
    { name: '生成微信设备Id', code: 'devices:generateWechatDeviceIds'},
    { name: '导入MAC地址', code: 'devices:importMACs'},

    { name: '新建厂商', code: 'manufacturer-accounts:create' },
    { name: '新建厂商账号', code: 'manufacturers:create' },

    //认证权限
    { name: '认证厂商', code: 'manufacturers:auth' },
    { name: '认证厂商账号', code: 'manufacturer-accounts:auth' },

    //内容权限
    { name: '新建故事分类', code: 'story-categories:create' },
    { name: '查看故事分类', code: 'story-categories:read' },
    { name: '更新故事分类', code: 'story-categories:update' },
    { name: '删除故事分类', code: 'story-categories:delete' },

    { name: '新建故事', code: 'stories:create' },
    { name: '查看故事', code: 'stories:read' },
    { name: '更新故事', code: 'stories:update' },
    { name: '删除故事', code: 'stories:delete' },

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

describe('设备号导入功能',()=>{

  describe('管理员相关权限测试验证',()=>{
    it('管理员角色权限',done=>{
      initAdmin(function () {
        done();
      })
    })

    it('管理员账号登录',done=>{
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
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);
          expect(token.split('.').length).to.be.equal(3);
          done();
      });
    })

    describe('依赖数据初始化',()=>{
      it('厂商及厂商账号添加',done=>{
        new Manufacturer({name:'大厂商',code:'bigbigbig'}).save(function (err,cs) {
          csEntity = cs;
          ManufacturerAccount.register(new ManufacturerAccount({email: manufacturerAccountName,manufacturer:cs}),password,(err,cszh)=>{
            if (err) {
              console.log('errrrr:');
              console.log(err);
            }
            cszhEntity = cszh;
            expect(cszh.id).to.be.a('string');
            done();
          })
        })
      })
      it('管理员进行厂商认证',done=>{
        let option = {
          url: url.resolve(baseUrl,'/api/auth/manufacturers/auth'),
          body:{
            id:csEntity.id,
            name:csEntity.name,
            code:csEntity.code,
            status:1
          },
          headers:{
            'Authorization':Authorization + token
          },
          json:true
        }
        request.post(option,(err, res, body)=>{
          if (err) {
            console.log(err);
          }
          expect(body.id).to.be.equal(csEntity.id);
          done();
        })
      })
      it('管理员进行厂商帐号认证',done=>{
        let option = {
          url: url.resolve(baseUrl,'/api/auth/manufacturer-accounts/auth'),
          body:{
            id:cszhEntity.id,
            status:1
          },
          headers:{
            'Authorization':Authorization + token
          },
          json:true
        }
        request.post(option,(err, res, body)=>{
          if (err) {
            console.log(err);
          }
          expect(body.id).to.be.equal(cszhEntity.id);
          done();
        })
      })
      it('厂商账号登录',done=>{
        let option = {
          url: url.resolve(baseUrl,'/api/manufacturer/auth/login'),
          body:{
            email:manufacturerAccountName,
            password:password
          },
          json:true
        }
        request.post(option,(err, res, body)=>{
          if (err) {
            console.log(err);
          }
          cszhToken = body.token;
          expect(body.token.split('.').length).to.be.equal(3);
          done();
        })
      })
      it('型号添加',done=>{
        let option = {
          url: url.resolve(baseUrl,'/api/auth/models'),
          body:{
            name:'宝宝树',
            code:'bbtree'
          },
          headers:{
            'Authorization':Authorization + cszhToken
          },
          json:true
        }
        request.post(option,(err, res, body)=>{
          if (err) {
            console.log(err);
          }
          modelEntity = body;
          expect(body.id).to.be.a('string');
          done();
        })
      })
      it('批次添加',done=>{
        let option = {
          url: url.resolve(baseUrl,'/api/auth/batches'),
          body:{
            model:modelEntity.id,
            quantity:1,
            state:0
          },
          headers:{
            'Authorization':Authorization + cszhToken
          },
          json:true
        }
        request.post(option,(err, res, body)=>{
          if (err) {
            console.log(err);
          }
          batchId = body.id
          expect(body.id).to.be.a('string');
          done();
        })
      })
      describe('管理员导入阿里云设备Id',()=>{

        it('导入阿里云设备Id',done=>{
          var formData ={
            url:url.resolve(baseUrl,'/api/auth/devices/uploadAliIds'),
            body:{
              files:{
                file:fs.createReadStream(__dirname+'/deviceData/aliid1.json'),
              },
              batchId:batchId
            },
            headers:{
              'Authorization':Authorization + token
            },
            json:true
          }
          request.post(formData,function (err, httpResponse, body) {
            if (body.code !== 200) {
              console.log('err:',body.msg);
            }
            expect(body.code).to.be.equal(200);
            done();
          })
        })

        it('导入阿里云设备Id 文件没有选择',done=>{
          var formData ={
            url:url.resolve(baseUrl,'/api/auth/devices/uploadAliIds'),
            body:{
              batchId:batchId
            },
            headers:{
              'Authorization':Authorization + token
            },
            json:true
          }
          request.post(formData,function (err, httpResponse, body) {
            if (body.code !== 400) {
              console.log('err:',body.msg);
            }
            expect(body.code).to.be.equal(400);
            done();
          })
        })

        it('导入阿里云设备Id,JSON格式有误的情况',done=>{
          var formData ={
            url:url.resolve(baseUrl,'/api/auth/devices/uploadAliIds'),
            body:{
              files:{
                file:fs.createReadStream(__dirname+'/deviceData/aliidErrFormat.json'),
              },
              batchId:batchId
            },
            headers:{
              'Authorization':Authorization + token
            },
            json:true
          }
          request.post(formData,function (err, httpResponse, body) {
            if (body.code !== 400) {
              console.log('err:',body.msg);
            }
            expect(body.code).to.be.equal(400);
            done();
          })
        })

        it('导入阿里云设备Id,没有传入批次Id',done=>{
          var formData ={
            url:url.resolve(baseUrl,'/api/auth/devices/uploadAliIds'),
            body:{
              files:{
                file:fs.createReadStream(__dirname+'/deviceData/aliid1.json'),
              }
            },
            headers:{
              'Authorization':Authorization + token
            },
            json:true
          }
          request.post(formData,function (err, httpResponse, body) {
            if (body.code !== 400) {
              console.log('err:',body.msg);
            }
            expect(body.code).to.be.equal(400);
            done();
          })
        })

        describe('管理员导入设备mac Id',done=>{
          it('导入mac Id',done=>{
            var option ={
              url:url.resolve(baseUrl,'/api/auth/devices/uploadMacIds'),
              body:{
                files:{
                  file:fs.createReadStream(__dirname+'/deviceData/macIds1.xlsx'),
                },
                batchId:batchId
              },
              headers:{
                'Authorization':Authorization + token
              },
              json:true
            }
            request.post(option,(err,res,body)=>{
              if (body.code !== 200) {
                console.log('info:',body.msg);
              }
              expect(body.code).to.be.equal(200);
              done();
            })
          })

          it('导入mac Id 没有选择文件',done=>{
            var option ={
              url:url.resolve(baseUrl,'/api/auth/devices/uploadMacIds'),
              body:{
                batchId:batchId
              },
              headers:{
                'Authorization':Authorization + token
              },
              json:true
            }
            request.post(option,(err,res,body)=>{
              if (body.code !== 400) {
                console.log('info:',body.msg);
              }
              expect(body.code).to.be.equal(400);
              done();
            })
          })

          it('导入mac Id ,批次id缺失的情况',done=>{
            var option ={
              url:url.resolve(baseUrl,'/api/auth/devices/uploadMacIds'),
              body:{
                files:{
                  file:fs.createReadStream(__dirname+'/deviceData/macIds1.xlsx'),
                }
              },
              headers:{
                'Authorization':Authorization + token
              },
              json:true
            }
            request.post(option,(err,res,body)=>{
              if (body.code !== 400) {
                console.log('info:',body.msg);
              }
              expect(body.code).to.be.equal(400);
              done();
            })
          })

          it('导入mac Id 文件内容有误',done=>{
            var option ={
              url:url.resolve(baseUrl,'/api/auth/devices/uploadMacIds'),
              body:{
                files:{
                  file:fs.createReadStream(__dirname+'/deviceData/macIdsEmptyContent.xlsx'),
                },
                batchId:batchId
              },
              headers:{
                'Authorization':Authorization + token
              },
              json:true
            }
            request.post(option,(err,res,body)=>{
              if (body.code !== 400) {
                console.log('info:',body.msg);
              }
              expect(body.code).to.be.equal(400);
              done();
            })
          })

          it('管理员导入微信设备Id',done=>{
            var option ={
              url:url.resolve(baseUrl,'/api/auth/devices/generateWechatDeviceIds'),
              body:{
                batchId:batchId
              },
              headers:{
                'Authorization':Authorization + token
              },
              json:true
            }
            request.post(option,(err,res,body)=>{
              if (body.code !== 200) {
                console.log('err:',body.msg);
              }
              expect(body.code).to.be.equal(200);
              done();
            })
          })

          describe('管理员作废批次',done=>{
            it('管理员作废批次',done=>{
              var option ={
                url:url.resolve(baseUrl,'/api/auth/batches/invalidateBatch'),
                body:{
                  batchId:batchId
                },
                headers:{
                  'Authorization':Authorization + token
                },
                json:true
              }
              request.post(option,(err,res,body)=>{
                if (body.code !== 400) {
                  console.log('err:',body);
                }
                expect(body.code).to.be.equal(400);
                done();
              })
            })
          })
        })
      })
    })
  })
})
describe('管理员查看厂商及厂商账号',()=>{
  it('查看厂商列表',done=>{
    let option = {
      url: url.resolve(baseUrl,'/api/auth/manufacturers'),
      headers:{
        'Authorization':Authorization + token
      },
      json:true
    }
    request.get(option,(err, res, body)=>{
      if (err) {
        console.log(err);
      }
      expect(body.length).to.be.equal(1);
      done();
    })
  })
  it('查看厂商帐号列表',done=>{
    let option = {
      url: url.resolve(baseUrl,'/api/auth/manufacturer-accounts'),
      headers:{
        'Authorization':Authorization + token
      },
      json:true
    }
    request.get(option,(err, res, body)=>{
      if (err) {
        console.log(err);
      }
      expect(body.length).to.be.equal(1);
      done();
    })
  })
})
