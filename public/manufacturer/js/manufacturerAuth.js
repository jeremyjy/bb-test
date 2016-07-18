function manufacturersAuthConfig(nga, admin) {

  var model = admin.getEntity('manufacturers');

  model.creationView()
    .title('厂商认证')
    .fields([
      nga.field('name').label('厂商')
        .validation({required: true}),
      nga.field('code').label('编码')
        .validation({required: true})
    ]);

  model.editionView()
    .fields(model.creationView().fields());

}
