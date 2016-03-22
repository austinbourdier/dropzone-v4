'use strict';

var express = require('express');
import Box from './box'
import Dropbox from './dropbox'
import Googledrive from './googledrive'
var router = express.Router();

router.get('/box/login', Box.authorizeBox);
router.get('/dropbox/login', Dropbox.getDBoxRequestToken, Dropbox.requestDBoxAccessToken);
router.get('/googledrive/login', Googledrive.generateAuthUrl);
router.get('/box/callback', Box.getBoxAccessToken, Box.getBoxFiles);
router.get('/dropbox/callback', Dropbox.getDBoxAccessToken, Dropbox.getDropBoxFiles);
router.get('/googledrive/callback', Googledrive.getGoogleDriveToken, Googledrive.getGoogleDriveFiles);
router.get('/files', function(req, res) {
  res.status(200).json({
    dropboxfiles: req.session.dropboxfiles,
    boxfiles: req.session.boxfiles,
    googledrivefiles: req.session.googledrivefiles,
  })
});

module.exports = router;
