function modelConfig(nga, admin) {

  var model = admin.getEntity('models');

  model.listView()
    .title('设备型号')
    .fields([
        nga.field('icon', 'template').label('头像')
            .template('<img  src="{{ entry.values.icon }}" width="25" style="margin-top:-5px">'),
      nga.field('name').label('名称'),
      nga.field('code').label('编码')
    ])
    .listActions(['edit', 'delete']);

  model.creationView()
    .title('建立新型号')
    .fields([
      nga.field('name').label('名称')
        .validation({required: true}),
      nga.field('code').label('编码')
        .validation({required: true}),
      // nga.field('icon', 'template').label('头像')
      //    .template('<input type="file" ngf-select ng-model="picFile" value="picFile" name="file" accept="image/*" ngf-max-size="2MB" required ngf-model-invalid="errorFile"> <img ng-show="myForm.file.$valid" ngf-thumbnail="picFile" class="thumb" style="width: 80px;height: 80px"> <button ng-click="uploadPic(picFile)">Submit</button>')
        nga.field('icon', 'file').uploadInformation({ 'url': '/upload/image','upload': 'image', 'accept': 'image*','apifilename': 'url'})
            .validation({ required: true }),
        nga.field('').label('缩略图')
            .template('<img src="{{entry.values.icon}}" class="thumb" style="width: 80px;height: 80px" style="vertical-align: text-bottom">')
    ]);

  model.editionView()
      .title('修改型号')
    .fields(model.creationView().fields());

    model.deletionView()
        .title('删除设备型号')
}
