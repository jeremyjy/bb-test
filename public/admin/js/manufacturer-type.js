function manufacturerTypeConfig(nga, admin) {

  var manufacturerTypes = admin.getEntity('manufacturer-types');

  manufacturerTypes.listView()
    .title('厂商类型')
    .fields([
      nga.field('name').label('类型名称'),
      nga.field('code').label('类型值')
    ])
    .actions(['create'])
    .listActions(['edit', 'delete']);

  manufacturerTypes.creationView()
    .fields([
      nga.field('name').label('类型名称'),
      nga.field('code').label('类型值')
    ]);

  manufacturerTypes.editionView()
    .fields([
      nga.field('name').label('类型名称'),
      nga.field('code').label('类型值')
    ]);

}
