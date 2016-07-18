'use strict';
const authRouter = require('.').authRouter;
const commonRouter = require('.').commonRouter;

let libManufacturer = require('./lib/manufacturer');
let resource = require('../services/resource-service');
let frontResource = require('../services/front-resource-service');
let AdministratorService = require('../services/account/administrator-service');
let ds = require('../services/device-service');
let upload = require('../services/upload-service');
let administractorService = new AdministratorService();
let ximalayService = require('../services/wechat/ximalay-service')

commonRouter.use(frontResource('story-categories', 'StoryCategory'));
commonRouter.use(frontResource('stories', 'Story'));

//喜马拉雅 路由
commonRouter.get('/ximalaya',ximalayService.categories);
commonRouter.get('/ximalaya/category',ximalayService.categories);
commonRouter.get('/ximalaya/storylist',ximalayService.categories);
commonRouter.get('/ximalaya/detail',ximalayService.categories);


//Device模块路由
authRouter.post('/devices/uploadAliIds', administractorService.checkOperateScope('devices','importAliyunDeviceIds'), ds.checkBatchState, ds.uploadAliIds);
authRouter.post('/devices/generateWechatDeviceIds', administractorService.checkOperateScope('devices','generateWechatDeviceIds'), ds.checkBatchState, ds.reqesutWechatDeviceIds, ds.generateWechatDeviceIds);
authRouter.post('/devices/uploadMacIds', administractorService.checkOperateScope('devices','importMACs'), ds.checkBatchState, ds.parseMacIds_XLSX, ds.uploadMacIds);
authRouter.post('/batches/invalidateBatch', administractorService.checkOperateScope('batches','invalidate'), ds.checkBatchState, ds.invalidBatch);
commonRouter.use('/devices/status',ds.addFlowerSignIn);
commonRouter.use('/devices/:macAddress/flowers',ds.checkFlowers);

authRouter.post('/administrator-accounts', administractorService.addAdmin);

//update 与 create 只能添加基本信息，过滤掉状态字段
authRouter.use('/manufacturers',administractorService.filterManufacturerStatus);
authRouter.use('/manufacturer-accounts',administractorService.filterManufacturerStatus);

//管理员认证厂商
authRouter.post('/manufacturers/auth',administractorService.checkOperateScope('manufacturers','auth'),administractorService.authManufacturer)
//管理员认证 厂商账号
authRouter.post('/manufacturer-accounts/auth',administractorService.checkOperateScope('manufacturer-accounts','auth'),administractorService.authManufacturerAccount)

commonRouter.post('/upload/image', libManufacturer.uploadImg);
commonRouter.post('/upload/logo', upload.uploadLogo);
commonRouter.post('/upload/story', upload.uploadStory);

authRouter.use('/batches', libManufacturer.authenticateVerify, libManufacturer.batches);
authRouter.use('/models', libManufacturer.authenticateVerify, libManufacturer.models);

authRouter.post('/batches', ds.createDevices);

//StoryCategory
authRouter.post('/story-categories/save-order',require('../services/story-category-service').saveOrder);

authRouter.use(resource('administrator-accounts', 'AdministratorAccount'));
authRouter.use(resource('customer-accounts', 'CustomerAccount'));
authRouter.use(resource('manufacturer-accounts', 'ManufacturerAccount'));

authRouter.use(resource('roles', 'Role'));
authRouter.use(resource('permissions', 'Permission'));

authRouter.use(resource('manufacturers', 'Manufacturer'));
authRouter.use(resource('batches', 'Batch'));
authRouter.use(resource('models', 'Model'));
authRouter.use(resource('devices', 'Device'));
authRouter.use(resource('manufacturer-types', 'ManufacturerType'));
authRouter.use(resource('story-categories', 'StoryCategory'));
authRouter.use(resource('stories', 'Story'));
