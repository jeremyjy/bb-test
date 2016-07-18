/**
 * Created by JiamingLinn on 16-7-2.
 */
'use strict';

require('../nconf');
require('../mongoose');

const mongoose = require('mongoose');
const async = require('async');

let data = {
  Group: [{
    groupId: '57787d9fdca88774176fdd4a',
    members: [{
      socialAccount: '10',
      nickName: 'hgw'
    }, {
      socialAccount: '11',
      nickName: 'ljm'
    }, {
      socialAccount: '01',
      nickName: 'rock'
    }, {
      socialAccount: '02',
      nickName: 'rock2'
    }]
  }],
  Device: [{
    socialAccount: '01',
    macAddress: '12-345'
  }, {
    socialAccount: '02',
    macAddress: '123-45'
  }],
  CustomerAccount: [{
    socialAccount: '10',
    wechatOpenId: 'oo-8kwX7tqTe2qgkn_J_-gYTVf_o',
    nickName: 'ljm'
  }, {
    socialAccount: '11',
    wechatOpenId: 'oo-8kwXoPsA2CywpVvLQE_XYLZr8',
    nickName: 'hgw'
  }]
};

Promise.all(['Group', 'Device', 'CustomerAccount'].map(modelName => {
  let model = mongoose.model(modelName);
  return Promise.all(data[modelName].map(data=> {
    return new model(data).save();
  }));
})).then(() => {
  mongoose.disconnect();
});