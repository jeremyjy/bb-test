var request = require("request");
var expect = require('chai').expect;

var baseUrl = 'http://127.0.0.1:3000';


describe('服务商选择', function () {
    it('查询成功',function(done){
        request(baseUrl+'/api/voiceProviders/tts-s', function (err, res, body) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            done();
        })
    })
    it('没有服务',function(done){
        request(baseUrl+'/api/voiceProviders/tts-x', function (err, res, body) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(500);
            expect(body).to.be.equal('no service!');
            done();
        })
    })
})
