var express = require('express');
var cors = require('cors');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var glob = require('glob');
var path = require('path');
var nconf = require('nconf');
var connectMultiparty = require('connect-multiparty');

var app = express();

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(connectMultiparty());
app.use(require('./routers').router);
app.use(require('./errorHandler'));

app.listen(nconf.get('port') || 3000, function() {
  console.log('Server running at http://127.0.0.1:' + nconf.get('port') || 3000);
});
