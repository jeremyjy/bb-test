var nconf = require('nconf');
var router = require('.').router;
var commonRouter = require('.').commonRouter;
var authRouter = require('.').authRouter;
var passport = require('passport');
var WeChat = require('wechat');
var WechatService = require('../services/account/customer-service');
var weService = require('../services/wechat-service.js');
var storyService = require('../services/wechat/story-service');
var emojiService = require('../services/wechat/emoji-service');
var habitPlanService = require('../services/wechat/habit-plan-service');
var Promise = require('bluebird');
var flowerService = require('../services/flower/FlowerService');
var Customer = Promise.promisifyAll(require('../models/customer-account'));

var config = {
  token: nconf.get('wechat:token'),
  appid: nconf.get('wechat:appId'),
  appsecret: nconf.get('wechat:appSerect'),
  encodingAESKey: nconf.get('wechat:encodingAESKey')
};
var ws = new WechatService();

// airkiss
commonRouter.get('/wechat/getJsApiConfig', weService.getJsConfig);   //获取微信H5 jsApi 相关配置




//微信app TODO 加token验证
authRouter.get('/wx/createMenu',ws.createMenu);
commonRouter.get('/wx/login',ws.requestWechatLogin);
authRouter.get('/wx/jsapi',ws.wechatJsApiSign);
authRouter.get('/wx/wechatCallback',ws.wechatCallback,ws.checkAccount,ws.getToken);
authRouter.get('/wx/pushStory',storyService.pushStory);
authRouter.post('/wx/pushStory',storyService.pushStory);

//表情包
commonRouter.get('/wechat/emoji', emojiService.getEmoji); //获取表情包
commonRouter.post('/wechat/emoji/dibble', emojiService.emojiDibble); //点播表情包

//习惯养成
commonRouter.get('/wechat/habitPlan', habitPlanService.getHabitPlan); //获取习惯列表
commonRouter.post('/wechat/habitPlan', habitPlanService.createHabitPlan); //创建习惯
commonRouter.delete('/wechat/habitPlan', habitPlanService.deleteHabitPlan); //删除习惯

commonRouter.get('/wechat/getDevice', weService.getOpenId, weService.Devices);  //微信H5获取用户绑定设备
commonRouter.get('/wechat/unbindDevice', weService.unbindDevice); //微信H5页面解绑

//social
commonRouter.get('/wechat/inviteFamilyMember', weService.getOpenId, weService.invteFamilyMember);//邀请家人
commonRouter.get('/wechat/exitGroup',  weService.getOpenId, weService.exitGroup);//退出家庭圈
commonRouter.get('/wechat/showFamilyMembers', weService.getOpenId, weService.showFamilyMembers);//查看家庭列表
commonRouter.get('/wechat/changeNickName', weService.getOpenId, weService.changeNickName);//修改家庭昵称
commonRouter.get('/wechat/showDeviceQRcode', weService.getOpenId, weService.showDeviceQRcode);//设备二维码页面
commonRouter.get('/wechat/removeDeviceFriends', weService.getOpenId, weService.removeDeviceFriends);//删除好友
commonRouter.get('/wechat/addDeviceFriends', weService.getOpenId, weService.addDeviceFriends);//添加好友
commonRouter.get('/wechat/confirmDeviceFriends', weService.getOpenId, weService.confirmDeviceFriends);//确认添加好友
commonRouter.get('/wechat/changeFriendNickName', weService.getOpenId, weService.changeFriendNickName);//修改好友昵称
commonRouter.get('/wechat/showDeviceFriends', weService.getOpenId, weService.showDeviceFriends);//设备好友列表
commonRouter.get('/wechat/changeDeviceName', weService.getOpenId, weService.changeDeviceName);//修改设备名称

commonRouter.get('/wechat/calculateFlowers', weService.getOpenId,function (req,res,next) {
  var data = {};
  Customer.findOne({wechatOpenId: req.openid})
      .populate({path: 'deviceId', select: '-_id'})
      .exec().then(function (cus) {
    data.customer = cus;
    return flowerService.calculate(cus.deviceId[0].macAddress);
  }).then(function (result) {
    data.result =result;
    res.json(data);
  })
})
commonRouter.get('/wechat/checkFlowers', weService.getOpenId,function (req,res,next) {
  var date = req.query.date;
  Customer.findOne({wechatOpenId: req.openid})
      .populate({path: 'deviceId', select: '-_id'})
      .exec().then(function (cus) {
    return flowerService.checkFlowers(cus.deviceId[0].macAddress,date)
  }).then(function (data) {
    res.json(data);
  })
})

//voice
var voiceChat = require('../services/voice-chat/voice-chat');

router.use('/wechat', WeChat(config).voice(function(msg, req, res) {
  res.send('');
  voiceChat.setReceiver('wx');
  return voiceChat.listenGroup(msg, (err, res) => {
    console.log(err, res);
  });
}).middlewarify());


// message
router.use('/wechat', WeChat(config, weService.message));
