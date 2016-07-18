/**
 * 阿里云服务配置
 */
var config = {
  // 基本配置
  AccessKeyId: 'C6LaVmIDtu1KWQQy',
  AccessKeySecret: '3nDIyVbHIeeANhTVmRFAAqfgkEshKU',
  // iot
  iot: {
    Version: '2016-01-04',
    Format: 'json',
    RegionId: 'cn_hangzhou',
    AppKey: '23360505'
  },
  // version 2016-05-30
  iot20160530: {
    Version: '2016-05-30',
    Format: 'json',
    RegionId: 'cn_hangzhou',
    ProductKey: '23360505'
  },
  // oss
  oss: {
    region: 'oss-cn-shenzhen',
    //私密 语音聊天 oss
    voiceChatBucket: 'voice-chat',
    //读公开
    emojiBucket: 'bbcloud-emoji',
    logoBucket: 'bbcloud-logo',
    storyBucket: 'bbcloud-story'
  }
};

module.exports = config;
