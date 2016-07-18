function storyConfig(nga, admin) {

  var story = admin.getEntity('stories');
  var category = admin.getEntity('story-categories');

  story.listView()
    .title('故事')
    .fields([
      nga.field('name').label('名称'),
      nga.field('category', 'reference').label('分类')
        .targetEntity(category)
        .targetField(nga.field('name'))
    ])
    .actions(['<create-story></create-story>'])
    .listActions(['edit', 'delete']);

  story.creationView()
    .fields([
      nga.field('name').label('名称'),
      nga.field('category', 'reference').label('分类')
        .targetEntity(category)
        .targetField(nga.field('name')),
      nga.field('fileName', 'file').label('音频文件').uploadInformation({ 'url': '/upload/image', 'accept': 'audio*','apifilename': 'url'})
          .validation({ required: true })
    ]);

  story.editionView()
    .fields(story.creationView().fields());

}
