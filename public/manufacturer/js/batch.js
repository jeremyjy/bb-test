function batchConfig(nga, admin) {

    var batch = admin.getEntity('batches');
    var model = admin.getEntity('models');

    batch.listView()
        .title('批次管理')
        .fields([
            nga.field('id').label('批次号'),
            nga.field('model', 'reference').label('型号')
                .targetEntity(model)
                .targetField(nga.field('name')),
            nga.field('quantity', 'number').label('数量'),
            nga.field('createdAt').label('下单日期')
        ])
        .filters([
            nga.field('model', 'reference').label('型号')
                .pinned(true)
                .targetEntity(model)
                .targetField(nga.field('name'))
                .label('型号:')
        ])
        .actions(['batch', 'create'])
        .listActions(['show', 'delete']);

    batch.creationView()
        .fields([
            nga.field('model', 'reference').label('型号')
                .targetEntity(model)
                .targetField(nga.field('name')),
            nga.field('quantity', 'number').label('数量')
        ]);

    batch.showView()
        .title('型号信息')
        .fields([
            nga.field('model', 'reference').label('型号')
                .targetEntity(model)
                .targetField(nga.field('name')),
            nga.field('quantity', 'number').label('数量'),
            nga.field('createdAt').label('下单日期')
        ]);
    batch.editionView()
        .title('修改型号')

}
