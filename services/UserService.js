const util = require('util');
var crypto = require('crypto');
var BaseService = require('./BaseService');
var User = require('../models/User');

/*
* UserService继承BaseService
*/
function UserService() {
    BaseService.call(this);
}
util.inherits(UserService, BaseService);

var userService = new UserService();

/*
* 初始化操作
* 为各种topic添加订阅者
*/
userService.init(function(){
	userService.addSubscriber('userList', userService);
	userService.addSubscriber('addUser', userService);
	userService.addSubscriber('deleteUser', userService);
	userService.addSubscriber('findUserByName', userService);
	userService.addSubscriber('updateUser', userService);
	
});

/*
* 监听事件 - userList
* 监听器function(data, callback) - data:传入的数据；callback: 回调函数
* 回调函数callback(error, data)
*/
userService.listen('userList', function(data, callback){
	User.find(function (err, users) {
		if (err){
			callback(err, null);
			return;
		} 
		console.log(users);
		callback(null, users);
	})
});

/*
 * 监听事件 - addUser
 * 监听器function(data, callback) - data:传入的数据；callback: 回调函数
 * 回调函数callback(error, data)
 */
userService.listen('addUser', function(data, callback){
	var hash=crypto.createHash("md5");
	hash.update(data.password);
	var hexPassword=hash.digest('hex');

	var user = new User({
		name: data.name,
		password: hexPassword,
		email: data.email,
		registerTime: new Date()
	});
	
	user.save(function (err) {
		if (err){
			callback(err, null);
			return;
		} 

		callback(null, {status:'sucess'});
	});	
	
});

/*
 * 监听事件 - deleteUser
 * 监听器function(data, callback) - data:传入的数据；callback: 回调函数
 * 回调函数callback(error, data)
 */
userService.listen('deleteUser', function(data, callback){
	var query = {
		name: data.name
	};
	
	User.remove(query, function (err) {
		if (err){
			callback(err, null);
		} else{
			callback(null, {status:'sucess'});
		}
	});
	
});

/*
 * 监听事件 - findUserByName
 * 监听器function(data, callback) - data:传入的数据；callback: 回调函数
 * 回调函数callback(error, data)
 */
userService.listen('findUserByName', function(data, callback){
	var query = {
		name: data.name
	};

	User.findOne(query, function (err, user) {
		if (err){
			callback(err, null);
		} else{
			callback(null, user);
		}
	});
});

/*
 * 监听事件 - updateUser
 * 监听器function(data, callback) - data:传入的数据；callback: 回调函数
 * 回调函数callback(error, data)
 */
userService.listen('updateUser', function(data, callback){
	//��ѯ����
	var query = {
		name: data.name
	};
	//���µ�����
	var updateData = { 
		$set: { 
			password: data.password 
		}
	};

	User.findOneAndUpdate(query,updateData, function (err, user) {
		if (err){
			callback(err, null);
		} else{
			callback(null, {status:'sucess'});
		}
	});
	
});

module.exports = userService;
