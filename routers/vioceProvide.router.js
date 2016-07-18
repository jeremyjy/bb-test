var nconf = require('nconf');
var router = require('.').commonRouter;
router.get('/voiceProviders/:code', getProvider);

function getProviderName(code){
    var voiceProvider = nconf.get('voiceProvider');
    if(!voiceProvider[code]){
        console.log('service does not exist!::code:'+code);
        return null;
    }
    if(!voiceProvider[code].providers){
        console.log('no providers for service::code:'+code);
        return null;
    }
    return voiceProvider[code].providers;
}

function getProvider(req,res,next){
    var code =req.params.code;
    if(!code){
        return res.status(400).send('requires params code!');
    }
    var providers = getProviderName(code);
    if(!providers){
       return res.status(500).send('no service!');
    }
    res.send(providers);
}

