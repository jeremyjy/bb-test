function storyCategoryConfig(nga, admin) {

  var storyCategory = admin.getEntity('story-categories');

  storyCategory.listView()
    .title('故事分类')
    .fields([
      nga.field('name').label('类型名称'),
      nga.field('order').label('排序'),
      nga.field('iconFileName','template').label('封面图')
        .template(entry => `<img src="${ entry.values.iconFileName }" width="25" style="margin-top:-5px" />`),
    ])
    .sortField('order')
    .sortDir('ASC')
    .actions(['create','<change-order></change-order>'])
    .listActions(['edit', 'delete']);

  storyCategory.creationView()
    .fields([
      nga.field('name').label('类型名称').validation({ required: true }),
      nga.field('iconFileName', 'file').label('封面图').uploadInformation({ 'url': '/upload/image','upload': 'image', 'accept': 'image*','apifilename': 'url'})
          .validation({ required: true }),
      nga.field('').label('缩略图').template('<img src="{{ entry.values.iconFileName }}" width="50" style="vertical-align: text-bottom"/>'),
      nga.field('description','text').label('描述')
    ]);

  storyCategory.editionView()
    .fields(storyCategory.creationView().fields());
}
