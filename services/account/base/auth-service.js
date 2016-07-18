'use strict';
const jwt = require('jsonwebtoken');
const nconf = require('nconf');
const mongoose = require('mongoose');
const co = require('co');
const moment = require('moment');

module.exports = class AuthService {

  createMiddleware() {
    const router = require('express').Router();
    const passport = require('passport');

    router.post(`/${this.name}/auth/signup`, this._signupRouter.bind(this));
    router.post(`/${this.name}/auth/login`, passport.authenticate(this.name, {
      session: false
    }), this._issueTokenRouter.bind(this));
    return router;
  }

  _issueTokenRouter(req, res, next) {
    const secret = nconf.get('secret');
    const RevokeToken = mongoose.model('RevokeToken');

    let subject = req.user.id;
    this.createTokenExtras(req.user, (err, extras) => {
      if (err) return next(err);

      extras = extras || {};
      extras.realm = this.name;

      let expiresIn = nconf.get('tokenExpiresIn');
      let revokeTokenDoc = new RevokeToken({
        uid: req.user.role
      });
      jwt.sign(extras, secret, {
        subject,
        expiresIn,
        jwtid: revokeTokenDoc._id.toString()
      }, (err, token) => {
        if (err) return next(err);
        else {
          revokeTokenDoc.save(err => {
            if (err) next(err);
            else {
              res.json({
                token
              });
            }
          });
        }
      });
    });
  }

  _signupRouter(req, res, next) {
    let model = this.getModelDataFromRequest(req.body);
    let password = this.getPasswordFromRequest(req.body);
    let Model = this.model;

    Model.register(new Model(model), password, (err) => {
      if (err) return next(err);
      res.json({
        code: 200,
        msg: 'ok'
      });
    });
  }

  getPasswordFromRequest(body) {
    return body.password
  }

}
