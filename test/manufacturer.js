'use strict';
require('../nconf');
require('../mongoose');
const request = require('request');
const expect = require('chai').expect;
const url = require('url');
const _ = require('lodash');
const mongoose = require('mongoose');

const baseUrl = 'http://127.0.0.1:3000';
const baseAuthPrefix = baseUrl + '/api/auth';
const baseCommonPrefix = baseUrl + '/api';

const Authorization = 'Bearer ';
const email = 'tosone@qq.com';
const password = 'password';
const newPwd = 'newpassword';

const modelName = 'testModel';
const modelCode = 'testCode';
const newModelName = 'newTestModel';
const newModelCode = 'newTestCode';
let modelId = '';
const manufacturerAuthName = 'testAuthName';
const manufacturerAuthCode = 'testAuthCode';
let manufacturerId = '';
let batcheId = '';

const batcheNum = 20;

let token = "";
let emailToken = "";

describe('厂家账户测试', () => {
  it('注册用户', done => {
    let option = {
      url: baseCommonPrefix + "/manufacturer/auth/signup",
      body: {
        email: email,
        password: password
      },
      json: true
    };
    request.post(option, (err, res, body) => {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      expect(body.code).to.be.equal(200);
      done();
    });
  });

  it('登陆测试', done => {
    let option = {
      url: baseCommonPrefix + "/manufacturer/auth/login",
      body: {
        email: email,
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
  });

  describe('邮件找回密码', () => {
    let option = {
      url: baseCommonPrefix + "/auth/manufacturer/resetPwd",
      headers: {
        "Authorization": ""
      },
      body: {
        email: email
      },
      json: true
    }

    it('错误的邮箱格式', done => {
      option.body.email = 'a@b.c';
      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        console.log(body.code);
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body.code).to.be.equal(500);
        expect(body.msg).to.be.equal('Not a vaild email.');
        done();
      });
    });

    it('错误的邮箱', done => {
      option.body.email = 'a@b.com';
      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body.code).to.be.equal(500);
        expect(body.msg).to.be.equal('This email has not been registered.');
        done();
      });
    });

    it('正确的邮箱', done => {
      option.body.email = email;
      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        emailToken = body.token;
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body.code).to.be.equal(200);
        done();
      });
    });

    it('利用失效邮件找回密码', done => {
      option.body.email = email;
      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body.code).to.be.equal(500);
        expect(body.msg).to.be.equal('Please wait for a moment to send another email.');
        done();
      });
    });

    describe('重设密码', () => {
      let option = {
        url: url.resolve(baseCommonPrefix, "/manufacturer/setPwd"),
        body: {
          password: newPwd
        },
        json: true
      }

      it('利用错误Token设置密码', done => {
        option.body.token = "wrong token";
        request.post(option, (err, res, body) => {
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);
          expect(body.code).to.be.equal(500);
          done();
        });
      });

      it('设置密码', done => {
        option.body.token = emailToken;
        request.post(option, (err, res, body) => {
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);
          expect(body.code).to.be.equal(200);
          done();
        });
      });
      it('重复利用Token设置密码', done => {
        option.body.token = emailToken;
        request.post(option, (err, res, body) => {
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);
          expect(body.code).to.be.equal(500);
          expect(body.msg).to.be.equal('Not a valid token.');
          done();
        });
      });

      it('新密码登陆', done => {
        let option = {
          url: url.resolve(baseCommonPrefix, "/manufacturer/auth/login"),
          body: {
            email: email,
            password: newPwd
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
      });
    });
  });
});

describe('厂家功能操作', () => {
  describe('型号操作', () => {
    let option = {
      url: baseAuthPrefix + "/models",
      headers: {
        "Authorization": ""
      },
      body: {
        name: modelName,
        code: modelCode
      },
      json: true
    };

    it('未认证厂家创建型号', done => {
      // TODO 暂时性返回错误, 完善错误后修改
      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body.msg).to.be.equal('ManufacturerAccount not authenticate');
        done();
      });
    });

    it('厂家认证', done => {
      let accountModel = mongoose.model('ManufacturerAccount');
      let option = {
        url: url.resolve(baseUrl, "api/auth/manufacturer/auth"),
        headers: {
          "Authorization": ""
        },
        body: {
          name: manufacturerAuthName,
          code: manufacturerAuthCode
        },
        json: true
      };
      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        manufacturerId = body.id;
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Object');
        expect(body.email).to.be.equal(email);
        accountModel.findOne({email: email}, (err, account) => {
          account.status = 1;
          account.save().then(function(){
            done();
          });
        });
      });
    });

    it('认证后重新登陆', done => {
      let option = {
        url: url.resolve(baseUrl, "/manufacturer/auth/login"),
        body: {
          email: email,
          password: newPwd
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
    });

    it('已认证厂家创建型号', done => {
      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        modelId = body.id;
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Object');
        expect(body.name).to.be.equal(modelName);
        expect(body.code).to.be.equal(modelCode);
        done();
      });
    });

    it('查询所有型号信息', done => {
      let option = {
        url: baseAuthPrefix + "/models",
        headers: {
          "Authorization": ""
        },
        json: true
      };

      option.headers.Authorization = Authorization + token;
      request.get(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Array');
        done();
      })
    });

    it('根据id修改型号信息', done => {
      let option = {
        url: baseAuthPrefix + "/models/" + modelId,
        headers: {
          "Authorization": ""
        },
        body: {
          name: newModelName,
          code: newModelCode
        },
        json: true
      };

      option.headers.Authorization = Authorization + token;
      request.put(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Object');
        expect(body.name).to.be.equal(modelName);
        expect(body.code).to.be.equal(modelCode);
        done();
      })
    });

    it('根据id查询型号信息', done => {
      let option = {
        url: baseAuthPrefix + "/models/" + modelId,
        headers: {
          "Authorization": ""
        },
        json: true
      };

      option.headers.Authorization = Authorization + token;
      request.get(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Object');
        expect(body.name).to.be.equal(newModelName);
        expect(body.code).to.be.equal(newModelCode);
        done();
      })
    });

    // it('根据id删除型号', done => {
    //     let option = {
    //         url: baseAuthPrefix + "/models/" + modelId,
    //         headers: {
    //             "Authorization": ""
    //         },
    //         json: true
    //     };
    //
    //     option.headers.Authorization = Authorization + token;
    //     request.delete(option, (err, res, body) => {
    //         expect(err).to.be.equal(null);
    //         expect(res.statusCode).to.be.equal(200);
    //         expect(body.name).to.be.equal(newModelName);
    //         expect(body.code).to.be.equal(newModelName);
    //         done();
    //     })
    // });
  });

  describe('批次操作', () => {
    it('厂家创建批次', done => {
      let option = {
        url: baseAuthPrefix + "/batches",
        headers: {
          "Authorization": ""
        },
        body: {
          model: modelId,
          quantity: batcheNum
        },
        json: true
      };

      option.headers.Authorization = Authorization + token;
      request.post(option, (err, res, body) => {
        batcheId = body.id;
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Object');
        expect(body.model).to.be.equal(modelId);
        expect(body.quantity).to.be.equal(batcheNum);
        done();
      });
    });

    it('厂家批次查询', done => {
      let option = {
        url: baseAuthPrefix + "/batches",
        headers: {
          "Authorization": ""
        },
        json: true
      };

      option.headers.Authorization = Authorization + token;
      request.get(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Array');
        done();
      });
    });

    it('厂家批次删除', done => {
      let option = {
        url: baseAuthPrefix + "/batches/" + batcheId,
        headers: {
          "Authorization": ""
        },
        json: true
      };

      option.headers.Authorization = Authorization + token;
      request.delete(option, (err, res, body) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.a('Object');
        expect(body.model).to.be.equal(modelId);
        expect(body.quantity).to.be.equal(batcheNum);
        done();
      });
    });
  });
});
