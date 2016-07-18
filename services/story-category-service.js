'use strict'
let StoryCategory = require('mongoose').model('StoryCategory');
let StoryCategoryService = {}

StoryCategoryService.saveOrder = function (req,res,next) {
  //Todo 检查权限
  if (req.body.entities) {
    new Promise(function (resolve,reject) {
      req.body.entities.forEach((item)=>{
        StoryCategory.findByIdAndUpdate(item.id,item).then((data)=>{
        })
      })
      resolve()
    }).then(()=>{
      res.send({msg:'ok , it is saved',code:200})
    }).catch((err)=>{
      return next({code:400,msg:err})
    })
  }
}

module.exports = StoryCategoryService;
