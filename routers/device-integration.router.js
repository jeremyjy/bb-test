const router = require('.').router;
var deviceIntegration = require('../services/device-integration-service');

//TODO 健康检查,暂时写在此
router.get('/health-check', function(req, res){
    res.json({msg: "ok"});
});

//设备激活: 上报事件
router.post('/analytics', deviceIntegration.analytics);

//设备激活: 交换信息
router.post('/devices/exchange-id', deviceIntegration.getDeviceInfo);

router.get('/devices/:macAddress/configuration', deviceIntegration.getDeviceAppConfiguration);

router.post('/devices/:macAddress/configuration-sync', deviceIntegration.deviceAppConfigurationSync);

module.exports = router;