var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var analyticSchema = new Schema({
    eventId: String,
    event: String,
    metadata: {type: Object},
    data: {type: Object}
});


var Analytic = mongoose.model('Analytic', analyticSchema);

module.exports = Analytic;