/**
 * Created by JeremyNg on 16/6/23.
 */
var http = require("http");
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"))  ;
var download = require('download');
var oss = require('../../services/aliyun/logo-oss');



var Photo = function () {
    this.getPhoto = function (name,url ) {
         return download(url)
            .then(function (data) {
                return fs.writeFile('tmp/' + name + '.jpg', data, "binary")
                }).then(function () {
                    return oss.putStream(name+'.jpg', fs.createReadStream('tmp/'+name+'.jpg'));
                })

    }
}

module.exports = new Photo();