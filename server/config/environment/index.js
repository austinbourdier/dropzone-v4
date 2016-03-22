'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 8888,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'dropzone-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.facebookAppId || '242690372743464',
    clientSecret: process.env.facebookAppSecret || '7ff666d8d13d5653ade47508ec699b02',
    callbackURL:  process.env.facebookAppCallback || '/auth/facebook/callback'
  },
  dropbox: {
    app_key : "ds2kqcdwy1govh4",
    app_secret:"osonxzioqfbyavc",
    app_callback:"http://localhost:8888/api/cloud/dropbox/callback"
  },
  box: {
    client_id:"2dm9bch842zwx2bn9fwpjz9wkkr5l37i",
    client_secret:"gWTjB4FtuLxcSYOYvwxCmNPszCi4yeG6",
    client_security_token:"security_token%3DKnhMJatFipTAnM0nHlZA",
    redirect:"http://localhost:8888/api/cloud/box/callback"
  },
  googleDrive: {
    client_id : "445443597106-ute7ueutuo14r8afnq97akelvuv56ra8.apps.googleusercontent.com",
    client_secret:"3oZZzZvhja4qdRU14Wtzb0Bj",
    redirect:"http://localhost:8888/api/cloud/googledrive/callback"
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
