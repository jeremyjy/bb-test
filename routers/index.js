'use strict';
const router = require('express').Router();
const passport = require('passport');
const nconf = require('nconf');
const glob = require('glob');
const path = require('path');
const authRouter = router;
const commonRouter = authRouter;

// let isRevoked = require('./lib/isRevokedToken');

glob('**/*.router.js', function(err, files) {
  files.forEach(function(file) {
    require(path.join(__dirname, path.basename(file)));
  });
});

router.use('/api', commonRouter);
router.use('/api/auth', passport.authenticate('jwt', {
  session: false
}), authRouter);

router.get('/api/current-time', (req, res) => {
  let time = Math.floor(new Date().getTime() / 1000);
  res.send({time});
});

const voiceChat = require('../services/voice-chat/voice-chat');
const async = require('async');

router.use('/api/devices/chat', (req, res) => {
  let msg = req.body;
  voiceChat.setReceiver('iot');
  if (msg.type === 'group') {
    voiceChat.listenGroup(msg, (err, res) => {
      console.log(err, res);
    });
  } else if (msg.type === 'single') {
    voiceChat.listenSingle(msg, (err, res) => {
      console.log(err, res);
    });
  }

  res.send('rec')
});

module.exports = {
  router, authRouter, commonRouter
};
