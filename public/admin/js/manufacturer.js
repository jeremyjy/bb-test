function manufacturerConfig(nga, admin) {

  var manufacturer = admin.getEntity('manufacturers');
  var manufacturerType = admin.getEntity('manufacturer-types');

  manufacturer.listView()
    .title('厂商管理')
    .fields([
      nga.field('name').label('名称'),
      nga.field('code').label('编码'),
      nga.field('status').label('审核状态').map((status)=>{
        var label = '';
        switch (status) {
          case 0:
            label = '未通过'
            break;
          case 1:
            label = '已通过'
            break;
          default:
            label = '待审核'
        }
        return label;
      })
    ])
    .listActions([
      'edit',
      'delete',
      '<account-list manufacturer="{{entry.values}}"></account-list>'
    ]);

  manufacturer.creationView()
    .fields([
      nga.field('name').label('名称'),
      nga.field('code').label('编码'),
    ]);

  manufacturer.editionView()
    .fields([
      nga.field('name').label('名称'),
      nga.field('code').label('编码'),
      nga.field('manufacturerType', 'reference').label('类型')
      .targetEntity(manufacturerType)
      .targetField(nga.field('name'))
    ])

}
