'use strict';

const WechatAPI = require('wechat-api');
const formstream = require('formstream');
const https = require('https');
const http = require('http');
const mime = require('mime');
const nconf = require('nconf');

mime.define({
  'audio/amr': ['amr']
});

/**
 *
 * @param mediaID
 * @param cb
 *  - err {Error}
 *  - res {Response}
 */
WechatAPI.prototype.getMediaStream = function(mediaID, cb) {
  return this.preRequest(getMediaStream, arguments);
};


function getMediaStream(mediaID, cb) {
  let that = WechatAPI.prototype;
  cb = cb || function() {};

  let url = 'https://api.weixin.qq.com/cgi-bin/media/get?' +
    'access_token=' + this.token.accessToken + '&' +
    'media_id=' + mediaID;

  let req = https.request(url, (res) => {
    return cb(null, res);
  });
  //req.on('error', () => {
  //  cb(new Error('error getting stream from wx'));
  //});
  req.end();

}

WechatAPI.prototype.uploadMediaStream = function() {
  return this.preRequest(uploadMediaStream, arguments);
};

function uploadMediaStream (res, filename, fileType, size, cb) {
  let form = formstream();
  form.stream('media', res, filename, fileType, size);

  let options = {
    method: 'POST',
    host: 'api.weixin.qq.com',
    path: '/cgi-bin/media/upload' + '?access_token=' + this.token.accessToken + '&type=voice',
    headers: form.headers()
  };
  let req = https.request(options, (res) => {
    let content = '';
    res.on('data', data => {
      content += data;
    }).on('end', () => {
      cb(null, JSON.parse(content));
    });
  });
  req.on('error', (err) => {
    return cb(err);
  });

  return form.pipe(req);
}
//eshine
// const wxapi = new WechatAPI('wxc0d52bc7e3debfdd', 'e381480f72ab3e1486db465670662253');
//bby
//const wxapi = new WechatAPI('wx51d16f6abd2213b5', '7de99acb9201a8c34326c636d3ddbcb3');
const wxapi = new WechatAPI(nconf.get('wechat:appId'), nconf.get('wechat:appSecret'));

module.exports = wxapi;
