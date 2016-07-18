function batchConfig(nga, admin) {

  var batch = admin.getEntity('batches');
  var model = admin.getEntity('models');
  var manufacturer = admin.getEntity('manufacturers');

  batch.listView()
    .title('批次管理')
    .fields([
      nga.field('id').label('批次号'),
      nga.field('manufacturer', 'reference').label('厂商')
        .targetEntity(manufacturer)
        .targetField(nga.field('name')),
      nga.field('model', 'reference').label('型号')
        .targetEntity(model)
        .targetField(nga.field('name')),
      nga.field('quantity', 'number').label('数量'),
      nga.field('createdAt').label('下单日期'),
      nga.field('status').label('状态').map((status)=>{
        var label = '';
        switch (status) {
          case -1:
            label = '已作废'
            break;
          case 0:
            label = '新建'
            break;
          case 1:
            label = '已完成'
            break;
          case 2:
            label = '已完成阿里设备Id的上传'
            break;
          case 3:
            label = '已完成设备macId的上传'
            break;
          case 4:
            label = '已导入微信设备Id'
            break;
          default:
            label = 'N/A'
        }
        return label;
      })
    ])
    .actions(['batch'])
    .listActions(['show', 'delete']);

  batch.showView()
    .fields([
      nga.field('id'),
      nga.field('model', 'reference').label('型号')
        .targetEntity(model)
        .targetField(nga.field('name')),
      nga.field('quantity', 'number').label('数量'),
      nga.field('createdAt').label('下单日期'),
      nga.field('custom_action1').label('')
                    .template('<upload-ali-ids batch="entry"></upload-ali-ids>'),
      nga.field('custom_action2').label('')
                    .template('<generate-wechat-id batch="entry"></generate-wechat-id>'),
      nga.field('custom_action3').label('')
                    .template('<upload-mac-ids batch="entry"></upload-mac-ids>'),
      nga.field('invalidateBatch').label('')
                    .template('<invalidate-batch batch="entry"></invalidate-batch>'),
    ]);

}
