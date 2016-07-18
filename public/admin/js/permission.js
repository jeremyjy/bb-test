function permissionConfig(nga, admin) {

  var permission = admin.getEntity('permissions');

  permission.listView()
    .title('权限')
    .fields([
      nga.field('name').label('名称'),
      nga.field('code').label('编码')
    ])
    .actions(['create'])
    .listActions(['edit', 'delete']);

  permission.creationView()
    .fields([
      nga.field('name').label('名称'),
      nga.field('code').label('编码')
    ]);

  permission.editionView()
    .fields([
      nga.field('name').label('名称'),
      nga.field('code').label('编码')
    ]);

}
