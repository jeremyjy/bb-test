function manufacturerAccountConfig(nga, admin) {

  var accounts = admin.getEntity('manufacturer-accounts');

  accounts.listView()
    .title('厂商账户')
    .fields([
      nga.field('email').label('账户'),
      nga.field('createdAt').label('加入时间')
    ])
    .actions(['create'])
    .listActions([
      'edit',
      'delete',
    ]);

  accounts.creationView()
    .fields([
      nga.field('email').label('账户'),
      nga.field('createdAt').label('加入时间')
    ]);

  accounts.editionView()
    .fields([
      nga.field('email').label('账户'),
      nga.field('createdAt').label('加入时间')
    ]);
}
