#####模块说明
本模块提供喜马拉雅开放平台API，详细请参照`开放平台API接口文档`。模块接口与喜马拉雅平台接口对照关系参照`interface-list.js`,命名规则按照小驼峰法。
##### 示例代码：
```js
const ximalay = require('./ximalaya-proxy');

//喜马拉雅接口 /tags/list

ximalay.getTagsList({category_id: 28, type:1}, (err, data) => {
  console.log(err, data);
});
ximalay.getTagsList({}, )
```