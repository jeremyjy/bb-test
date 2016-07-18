'use strict';
const AuthService = require('./base/auth-service');
const expressJwt = require('express-jwt');
const nodemailer = require('nodemailer');
const passport = require('passport');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const nconf = require('nconf');
const co = require('co');
const _ = require('lodash');

module.exports = class ManufacturerService extends AuthService {

  constructor() {
    super();
    this.name = 'manufacturer';
    this.manufacturerModel = mongoose.model('Manufacturer');
    this.model = mongoose.model('ManufacturerAccount');
    this.sendMailModel = mongoose.model('SendEmail');
    this.revokeTokenModel = mongoose.model('RevokeToken');
  }

  createTokenExtras(user, done) {
    this.model.findById(user.id).then(function(manufacturerAccount) {
      var manufacturer, status;
      try {
        manufacturer = manufacturerAccount.manufacturer.toString();
        status = manufacturerAccount.status.toString() || 0;
      } catch (err) {}
      done(null, {
        manufacturer,
        status
      });
    }).catch(done);
  }

  getModelDataFromRequest(body) {
    var email = body.email;
    var status = body.status || 0;
    return {
      email,
      status
    };
  }

  auth(req, res) {
    let id = req.user.sub;
    console.log('body:', req.body);
    let manufacturerModel = mongoose.model('Manufacturer');
    let where = {
      name: req.body.name,
      code: req.body.code
    };
    let accountModel = mongoose.model('ManufacturerAccount');
    manufacturerModel.findOne(where).then(function(item){
      if(item){
        var entity = _.defaults(req.body, item);
      }else{
        req.body.status = 0;
        var entity = manufacturerModel(req.body);
      }
      entity.save().then(function() {
        req.user.manufacturer = req.user.manufacturer || entity._id;
        //update account
        accountModel.findByIdAndUpdate(id, {
          manufacturer: entity._id
          // status: 1
        }).then(function(account) {
          if (!account) throw new Error('not fount');
          var o = account.toObject();
          o.id = o._id.toString();
          delete o._id;
          res.json(o)
        }).catch(function(e) {
          console.log('update account error :', e);
        });
      }).catch(function(e) {
        console.log(e);
        res.json({
          code: 500,
          msg: 'save error'
        });
      });
    });
  }

  changeOwnPwd(req, res) {
    let id = req.user.sub;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    let ManufacturerAccount = mongoose.model('ManufacturerAccount');

    if (!id || !oldPassword || !newPassword) {
      res.json({
        code: 500,
        msg: 'Can not change password due to wrong args.'
      });
    } else {
      co(function*() {
        let manufacturerAccount = yield new Promise((resolve, reject) => {
          ManufacturerAccount.findById(id, (err, doc) => {
            if (err) {
              res.json({
                code: 500,
                msg: 'Can not change password due to wrong id.'
              });
            } else {
              resolve(doc);
            }
          });
        });
        let manufacturerDoc = yield new Promise((resolve, reject) => {
          manufacturerAccount.authenticate(oldPassword, (err, manufacturerDoc) => {
            if (err || !manufacturerDoc) {
              res.json({
                code: 500,
                msg: 'Can not change password due to wrong password.'
              });
            } else {
              resolve(manufacturerDoc);
            }
          });
        });
        let manufacturerDocNewPwd = yield new Promise((resolve, reject) => {
          manufacturerDoc.setPassword(newPassword, (err, manufacturerDocNewPwd) => {
            if (err) {
              res.json({
                code: 500,
                msg: 'Can not change password due to password hash with salt error.'
              });
            } else {
              resolve(manufacturerDocNewPwd);
            }
          });
        });
        manufacturerDocNewPwd.save(err => {
          if (err) {
            res.json({
              code: 500,
              msg: 'Can not change password due to mongodb save error.'
            });
          } else {
            res.json({
              code: 200
            });
          }
        });
      });
    };
  }

  resetPwd(req, res, next) {
    let expiresIn = nconf.get('tokenExpiresIn');
    let email = req.body.email;

    let SendEmail = mongoose.model('SendEmail');
    let RevokeToken = mongoose.model('RevokeToken');
    let ManufacturerAccount = mongoose.model('ManufacturerAccount');

    let emailReg =
      /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    co(function*() {
      if (!emailReg.test(email)) {
        next({
          code: 500,
          msg: "Not a vaild email."
        });
      } else {
        let user = yield new Promise((resolve, reject) => {
          ManufacturerAccount.findByUsername(email, (err, user) => { //确认数据库中有这个邮箱
            if (!!!(err || user)) {
              reject({
                code: 500,
                msg: "This email has not been registered."
              });
            } else {
              resolve(user);
            }
          });
        });
        let sendEmailDoc = yield new Promise((resolve, reject) => {
          SendEmail.findOne({
            user: user._id.toString(),
            type: "resetPwd"
          }).sort({
            "timestamp": "desc"
          }).exec((err, sendEmailLog) => {
            if (sendEmailLog) {
              let nowTime = moment();
              let sendEmailTime = moment(sendEmailLog.timestamp).add(nconf.get("sendMailDelay"), 'seconds');
              if (!sendEmailTime.isBefore(nowTime)) { //防止邮件频繁发送
                reject({
                  code: 500,
                  msg: "Please wait for a moment to send another email."
                });
              }
            }
            resolve(new SendEmail({
              user,
              type: 'resetPwd'
            }));
          });
        });
        let revokeTokenDoc = yield Promise.resolve(new RevokeToken({}));
        let token = yield new Promise((resolve, reject) => {
          jwt.sign({
            sendEmailId: sendEmailDoc._id.toString()
          }, nconf.get('secret'), {
            subject: user._id.toString(),
            expiresIn,
            jwtid: revokeTokenDoc._id.toString()
          }, (err, token) => {
            if (err) {
              reject({
                code: 500,
                msg: "Jwt generate error, please retry."
              });
            } else {
              resolve(token);
            }
          });
        });
        let mailOptions = {
          from: nconf.get('mailFrom'),
          to: email,
          subject: '找回密码',
          html: `<table border="0" cellpadding="1" cellspacing="0" style="width:600px;border:1px solid #ddd;font-family:'Microsoft YaHei', Arial, sans-serif;box-shadow:0 0 20px #777;">
                  <tbody>
                    <tr>
                      <td bgcolor="#319400" height="60" style="padding-left:20px;color:#ffffff;font-size:30px;">用户密码找回</td>
                    </tr>
                    <tr>
                      <td bgcolor="#fff" style="padding:20px;">
                        <p style="font-size:20px;margin:10px;padding:0;">找回密码：请立即前往<a href="http://127.0.0.1:3000/manufacturer/#/setPwd?token=${token}" target="_blank">这里</a>找回密码。</p>
                      </td>
                    </tr>
                  </tbody>
                </table>`
        };
        yield new Promise((resolve, reject) => {
          nodemailer.createTransport(nconf.get("nodemailerTransporter")).sendMail(mailOptions, (err, info) => {
            if (err) {
              reject({
                code: 500,
                msg: "Send email failed, please retry."
              });
            } else {
              resolve(true);
            }
          });
        });
        yield new Promise((resolve, reject) => {
          revokeTokenDoc.save(err => {
            if (err) {
              reject({
                code: 500,
                msg: "Error: " + JSON.stringify(err)
              })
            } else {
              resolve(true);
            }
          });
        });
        yield new Promise((resolve, reject) => {
          sendEmailDoc.save(err => {
            if (err) {
              reject({
                code: 500,
                msg: "Send email log can not save to database, please retry."
              });
            } else {
              resolve(res.json({
                code: 200,
                msg: "We have send a email to you, please check your email.",
                token
              }));
            }
          });
        });
      }
    }).catch(err => {
      console.log("Error: " + JSON.stringify(err));
      next(err);
    });
  }

  setPwd(req, res, next) {
    let password = req.body.password;
    let token = req.body.token;

    let ManufacturerAccount = mongoose.model('ManufacturerAccount');
    let RevokeToken = mongoose.model('RevokeToken');
    let SendEmail = mongoose.model('SendEmail');

    co(function*() {
      let decode = yield new Promise((resolve, reject) => {
        jwt.verify(token, nconf.get('secret'), (err, decode) => { //确认token有效
          if (err) {
            reject({
              code: 500,
              msg: JSON.stringify(err)
            });
          } else {
            resolve(decode);
          }
        });
      });

      let sendEmailId = decode.sendEmailId;
      let userId = decode.sub;
      let jti = decode.jti;

      let isValidToken = yield new Promise((resolve, reject) => {
        RevokeToken.findById(jti, (err, doc) => {
          if (err || !!!doc || !doc.active) {
            reject({
              code: 500,
              msg: "Not a valid token."
            });
          } else {
            resolve(true);
          }
        });
      });

      if (!isValidToken) {
        return yield Promise.reject({
          code: 500,
          msg: "Not a valid token."
        });
      } else {
        let sendEmailLog = yield new Promise((resolve, reject) => {
          SendEmail.findById(sendEmailId, (err, sendEmailLog) => { //确认邮件发送的日志数据库中存在这个记录
            if (err) {
              reject({
                code: 500,
                msg: "Not a valid token."
              });
            } else {
              resolve(sendEmailLog);
            }
          });
        });
        let user = yield new Promise((resolve, reject) => {
          ManufacturerAccount.findById(userId, (err, user) => { //查找用户
            if (err) {
              reject({
                code: 500,
                msg: "Not a valid user."
              })
            } else {
              resolve(user);
            }
          });
        });
        yield new Promise((resolve, reject) => {
          RevokeToken.findById(jti, (err, doc) => {
            if (err || !!!doc) {
              reject({
                code: 500,
                msg: "No such a token id."
              });
            } else {
              doc.active = false;
              doc.save(err => {
                if (err) {
                  reject({
                    code: 500,
                    msg: "Error: " + JSON.stringify(err)
                  });
                } else {
                  resolve(true);
                }
              });
            }
          });
        });

        yield new Promise((resolve, reject) => {
          user.setPassword(password, (err, userdoc) => { //设置密码
            if (err) {
              reject({
                code: 500,
                msg: "Can not set password."
              });
            } else {
              userdoc.save(err => {
                if (err) {
                  reject({
                    code: 500,
                    msg: "Can not set password."
                  });
                } else {
                  res.json({
                    code: 200,
                    msg: "OK"
                  });
                }
              });
            }
          });
        });
      }
    }).catch(err => {
      console.log("Error: " + JSON.stringify(err));
      next(err);
    });
  }
}
