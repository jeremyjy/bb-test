'use strict';
const passport = require('passport');
const authRouter = require('.').authRouter;
const commonRouter = require('.').commonRouter;

let libManufacturer = require('./lib/manufacturer');
let libWechat = require('./lib/wechat');

let CustomerService = require('../services/account/customer-service');
let AdministratorService = require('../services/account/administrator-service');
let ManufacturerService = require('../services/account/manufacturer-service');

let customerService = new CustomerService();
let administractorService = new AdministratorService();
let manufacturerService = new ManufacturerService();

authRouter.get('/manufacturer/:id/select', libManufacturer.getSelect);

commonRouter.use(customerService.createMiddleware());
commonRouter.use(manufacturerService.createMiddleware());
commonRouter.use(administractorService.createMiddleware());

authRouter.post('/administrator-accounts/changePwd', administractorService.changePwd); //管理员修改其他管理员密码
authRouter.post('/administrator-accounts/changeOwnPwd', administractorService.changeOwnPwd); //管理员修改自己的密码

commonRouter.post('/manufacturer/resetPwd', manufacturerService.resetPwd); //厂家通过邮件找回密码
commonRouter.post('/manufacturer/setPwd', manufacturerService.setPwd); //厂家通过邮件链接跳回系统重设密码
authRouter.post('/manufacturer/changeOwnPwd', manufacturerService.changeOwnPwd); //厂家修改自己的密码
authRouter.post('/manufacturer/auth', manufacturerService.auth); //厂商认证逻辑
commonRouter.get('/admin/error', (req, res, next) => {
  console.log("commonRouter.router");
  next({
    code: 200
  });
});

commonRouter.post('/customer/auth/wechat', libWechat.wechatAuthenticate);
commonRouter.get('/customer/auth/wechat/callback', passport.authenticate('wechat-web', {
  session: false
}), libWechat.wechatCallback);
