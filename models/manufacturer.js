var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var manufacturerSchema = new Schema({
  name: {type: String, required: true},
  code: {type: String, default: Date.now, required: true, unique: true},
  businessLicenseUrl: {type: String}, //公司营业执照图片Url
  contactPerson: {type: String}, //联系人
  status: {type: Number}, //厂家认证状态- 1:未审核、0:审核通过、2:审核不通过，根据厂家提供的营业执照等资料，由平台运营人员审核
  manufacturerType: {type: Schema.Types.ObjectId, ref: 'ManufacturerType'}, //厂商类型
  auditedBy: {type: String} //认证人ID
});

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
