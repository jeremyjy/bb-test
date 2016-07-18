function administratorAccountConfig(nga, admin) {

  var administrator = admin.getEntity('administrator-accounts');
  var role = admin.getEntity('roles');

  administrator.listView()
    .title('管理员账户')
    .fields([
      nga.field('name').label('名称'),
      nga.field('role', 'reference').label('角色')
        .targetEntity(role)
        .targetField(nga.field('name'))
    ])
    .actions(['batch', 'create'])
    .listActions([
      'edit',
      'delete',
      '<change-pwd administrator="{{entry.values}}"></change-pwd>'
    ]);

  administrator.creationView()
    .fields([
      nga.field('name')
        .validation({required: true}),
      nga.field('password', 'password')
        .validation({required: true})
    ]);

  administrator.editionView()
    .fields([
      nga.field('name'),
      nga.field('role', 'reference').label('角色')
      .targetEntity(role)
      .targetField(nga.field('name'))
    ]);

}
