'use strict';
const nconf = require('nconf');
const passport = require('passport');
const mongoose = require('mongoose');
const WeChatStrategy = require('passport-wechat');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var CustomerAccount = require('./models/customer-account');
var AdministratorAccount = require('./models/administrator-account');
var ManufacturerAccount = require('./models/manufacturer-account');

var jwtOpts = {
  secretOrKey: nconf.get('secret'),
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer')
};

var wechatClientOpts = {
  appID: nconf.get('wechat:appId'),
  appSecret: nconf.get('wechat:appSecret'),
  client: 'wechat',
  callbackURL: nconf.get('wechat:callbackUrl'),
  scope: nconf.get('wechat:scope'),
  state: nconf.get('wechat:state')
};

var wechatWebOpts = {
  appID: nconf.get('wechat:appId'),
  appSecret: nconf.get('wechat:appSecret'),
  client: 'web',
  callbackURL: nconf.get('wechat:callbackUrl'),
  scope: nconf.get('wechat:scope'),
  state: nconf.get('wechat:state')
};

passport.use('customer', CustomerAccount.createStrategy());
passport.use('administrator', AdministratorAccount.createStrategy());
passport.use('manufacturer', ManufacturerAccount.createStrategy());
passport.use('wechat-web', new WeChatStrategy(wechatWebOpts, wechatVerify));
passport.use('wechat-client', new WeChatStrategy(wechatClientOpts, wechatVerify));
passport.use(new JwtStrategy(jwtOpts, jwtVerify));

function wechatVerify(accessToken, refreshToken, profile, done) {
  done();
}

function jwtVerify(payload, done) {
  isRevoked(payload, function(err) {
    done(err, payload);
  });
}

function isRevoked(payload, done) {
  console.log(payload);
  let jti = payload.jti;
  let RevokeToken = mongoose.model('RevokeToken');
  if (!!!jti) {
    return done("Invalid token due to jwt has no jti.");
  } else {
    RevokeToken.findById(jti, (err, doc) => {
      if (err || !!!doc || !doc.active) {
        return done("Revoked Token.");
      } else {
        return done();
      }
    });
  }
}
