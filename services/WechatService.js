var fs = require('fs');
var WechatAPI = require('wechat-api');
var wechatConfig = require('../wechat/wechat-config');
var wechatMenuConfig = require('../wechat/wechat-menu-config');

var wechatAPI = new WechatAPI(wechatConfig.appid,wechatConfig.appsecret, function (callback) {
	// 传入一个获取全局token的方法
	fs.readFile('../wechat/access_token.txt', 'utf8', function (err, txt) {
		if (err) {return callback(err);}
		callback(null, JSON.parse(txt));
	});
}, function (token, callback) {
	// 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
	// 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
	fs.writeFile('../wechat/access_token.txt', JSON.stringify(token), callback);
});

wechatAPI.addKfAccount('hegw4@eshinetech', 'hegw4', 'password', function(err,result){
	if (err) {
		console.dir(err);
		return;
	}
	if (result instanceof Buffer) {
		result = result.toString();
	}
	console.dir(result.toString());
	return;

});