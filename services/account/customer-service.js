'use strict';

var AuthService = require('./base/auth-service');
var mongoose = require('mongoose');
var nconf = require('nconf');
const jwt = require('jsonwebtoken');
var UUID = require('node-uuid');
var Customer = require('../../models/customer-account')
var WeChatOath = require('wechat-oauth');
var WechatAPI = require('wechat-api');
var client = new WeChatOath(nconf.get('wechat:appId'), nconf.get('wechat:appSecret'));
var wechatApi = new WechatAPI(nconf.get('wechat:appId'), nconf.get('wechat:appSecret'));
module.exports = class CustomerService extends AuthService {

  constructor() {
    super();
    this.name = 'customer';
    this.model = mongoose.model('CustomerAccount');
  }

  createTokenExtras(user, done) {
    done();
  }

  getModelDataFromRequest(body) {
    var mobilePhoneNumber = body.mobilePhoneNumber;
    return {mobilePhoneNumber};
  }


  requestWechatLogin(req, res, next){
    //微信登录
    res.redirect(client.getAuthorizeURL('http://czcioutest.ittun.com/wx/wechatCallback'));
    // res.redirect(client.getAuthorizeURL('http://192.168.0.110:3000/wx/wechatCallback'));
  }

  wechatCallback(req, res, next){
    var code = req.query.code;
    client.getAccessToken(code, function (err, result) {
      console.log('result.data',result.data);
      if (!result.data) {
        return next({code:400,msg:'login again please'})
      }
      var accessToken = result.data.access_token;
      var openid = result.data.openid;
      console.log('err:',err);
      console.log('openid:',openid);
      req.weixin = {};
      req.weixin.OpenID = openid;
      next();
    });
  }

  wechatJsApiSign(req,res,next){
    var jsApiList = [
          'checkJsApi',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareWeibo',
          'hideMenuItems',
          'showMenuItems',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem',
          'translateVoice',
          'startRecord',
          'stopRecord',
          'onRecordEnd',
          'playVoice',
          'pauseVoice',
          'stopVoice',
          'uploadVoice',
          'downloadVoice',
          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'getNetworkType',
          'openLocation',
          'getLocation',
          'hideOptionMenu',
          'showOptionMenu',
          'closeWindow',
          'scanQRCode',
          'chooseWXPay',
          'openProductSpecificView'
        ];
    var param = {
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: nconf.get('wechat:appId'), // 必填，公众号的唯一标识
        jsApiList: jsApiList, // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        url: req.query.url
    }
    wechatApi.getJsConfig(param,(err,result)=>{
      console.log('result is:',result);
      res.send(result);
    })
  }

  //wechat account   wechat app account
  //代微信用户直接登录
  getToken(req, res, next){
    const secret = nconf.get('secret');
    const RevokeToken = mongoose.model('RevokeToken');
    console.log('come in to getToken');
    let subject = req.user.id;
    var extras = {};
    extras.realm = 'customer';

    let expiresIn = nconf.get('tokenExpiresIn');
    let revokeTokenDoc = new RevokeToken({
      uid: req.user.role
    });
    jwt.sign(extras, secret, {
      subject,
      expiresIn,
      jwtid: revokeTokenDoc._id.toString()
    }, (err, token) => {
      console.log('token fenfa:',token);
      if (err) return next(err);
      else {
        revokeTokenDoc.save(err => {
          if (err) next(err);
          else {
            //返回到微信H5页面
            // res.send('<script>document.cookie="token='+token+'";location.href="/wx/index.html"</script>')
            res.send('<script>window.localStorage.setItem(\'token\',\''+token+'\');location.href=\'/wx/index.html\';</script>')
          }
        });
      }
    });
  }

  //检查是否已注册，没注册则注册。
  checkAccount(req, res, next){
    var message = req.weixin;
    var wechatOpenId = message.OpenID;
    Customer.findOne({wechatOpenId: wechatOpenId}, function (err, result) {
      if (err) {
        return next({code:400,msg:err});
      }
      if (!result) {
        var customer = new Customer();
        var uuid = UUID.v1();
        customer.wechatOpenId = message.OpenID;
        customer.name = message.FromUserName;
        customer.socialAccount = '1' + uuid;
        customer.socialPassword = uuid;
        customer.save(function (err,user) {
          if (err) {
            return res.status(500).send(err);
          }
          req.user = user;
          next();
        });
      } else {
        req.user = result;
        next();
      }
    });
  }

  createMenu(req,res,next) {
    var menu = {
        "button":[
          {
            "type": "device_event",
            "name": "设备绑定",
            "key": "bind",
          },
          {
            "type": "device_event",
            "name": "设备解绑",
            "key": "unbind",
          },
          {
            "type": "login",
            "name": "登录",
            "key": "rselfmenu_0_0",
          }
        ]
    };

    wechatAPI.createMenu(menujson, function (err,result) {
      if (err) {
        console.log('err:',err);
      }
      else{
        console.log('result',result);
      }
      res.end('ok')
    });
  }

}
