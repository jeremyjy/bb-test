var nconf = require('nconf');

nconf.argv().env();
var NODE_ENV = nconf.get('NODE_ENV') || 'development';
nconf.file({ file: 'config.' + NODE_ENV + '.json' });
