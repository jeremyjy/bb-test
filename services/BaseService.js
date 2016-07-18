const util = require('util');
const EventEmitter = require('events');

var ServiceBus = require('../servicebus/ServiceBus');

/*
* BaseService继承EventEmitter
*/
function BaseService() {
    EventEmitter.call(this);
}
util.inherits(BaseService, EventEmitter);

/*
* 初始化操作
*/
BaseService.prototype.init = function(callback){
	callback();
};

/*
* 新增topic订阅者
*/
BaseService.prototype.addSubscriber = function(topic, service){
	ServiceBus.getInstance().addSubscriber(topic, service);
};


/*
* 监听topic
*/
BaseService.prototype.listen = function(topic, listener){
	var subscriber = ServiceBus.getInstance().getSubscriber(topic);
	if (subscriber) {
		subscriber.on(topic, listener);
	} else {
		throw new Error('BaseService -> no subscriber found for topic - ' + topic);
	};
};

module.exports = BaseService;
