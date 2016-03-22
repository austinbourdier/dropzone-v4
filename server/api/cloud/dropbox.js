var dbox  = require("dbox");
var fs  = require("fs");
var path  = require("path");
import config from '../../config/environment';
var DBoxApp   = dbox.app({'root' : 'dropbox', "app_key": process.env.dropboxAppKey || config.dropbox.app_key, "app_secret": process.env.dropboxAppSecret || config.dropbox.app_secret})
var dropboxAppCallback = process.env.dropboxAppCallback || config.dropbox.app_callback;
import util from '../../components/util';

var Dropbox = {}
Dropbox.getDBoxRequestToken = function (req, res, next) {
  DBoxApp.requesttoken(function (status, request_token) {
        // TODO: error catch
    req.session.dbox_request_token = request_token;
    next();
  })
};

Dropbox.requestDBoxAccessToken = function (req, res, next) {
  res.redirect(req.session.dbox_request_token.authorize_url + "&oauth_callback="+dropboxAppCallback);
};

Dropbox.getDBoxAccessToken = function (req, res, next) {
  DBoxApp.accesstoken(req.session.dbox_request_token, function (status, access_token) {
        // TODO: error catch

    req.session.dbox_access_token = access_token;
    req.justAdded = 'dropbox';
    if(req.session.accessedClouds)
      req.session.accessedClouds.dropbox = true;
    else
      req.session.accessedClouds = {dropbox:true};
    next();
  })
};


Dropbox.getDropBoxFiles = function (req,res,next) {
  if(req.session.accessedClouds.dropbox) {
    if (req.delete || req.rename) {
      var parentID = req.body.options.parentID;
    };
    var id = parentID || req.body.currentFolder || req.query.folderId || '/';
    DBoxApp.client(req.session.dbox_access_token).metadata(id, {
      file_limit         : 10000,
      list               : true,
      include_deleted    : false,
      locale             : "en",
      root             : "dropbox"
    }, function (status, data) {
      // TODO: error catch

      if(!req.session.dropboxfiles) {
        data.contents.forEach(function(item) {
          item.id = item.path;
          item.parentID = id;
          var temp = item.path;
          item.name = temp.split('/').pop();
          if(item.is_dir) {
            item.type = 'folder';
            item.items = [];
          } else {
            item.type = 'file';
          }
        })
        req.session.dropboxfiles = {
          id: '/',
          items: data.contents,
          name: '/',
          type: 'folder',
          parentID: id
        }
      } else {
        if(req.delete) {
          req.session.dropboxfiles = util.updateTreeDeleteItem(id, req.body.options.id, req.session.dropboxfiles);
        } else {
          data.contents.forEach(function(item) {
          item.id = item.path;
          item.parentID = id;
          var temp = item.path;
          item.name = temp.split('/').pop();
            if(item.is_dir) {
              item.type = 'folder';
              item.items = [];
            } else {
              item.type = 'file';
            }
          })
          req.session.dropboxfiles = util.updateTreeWithNewPayLoad(id, data.contents, req.session.dropboxfiles);
        }
      }
      res.redirect('http://localhost:8888')
    })
  } else {
    res.redirect('http://localhost:8888')
  }
};

Dropbox.updateDropBoxFileName = function (req,res,next) {
  if(req.session.accessedClouds.dropbox) {
    DBoxApp.client(req.session.dbox_access_token).mv(req.body.id, req.body.title, function (status, data) {
      // TODO: error catch
      req.update = true;
      next();
    })
  } else {
    next();
  }
};

Dropbox.moveDropBoxFile = function (req,res,next) {
  if(req.session.accessedClouds.dropbox) {
    DBoxApp.client(req.session.dbox_access_token).mv(req.body.file.path, req.body.parentID, function (status, data) {
      // TODO: error catch
      if(!req.body.copy)
        req.session.dropboxfiles = util.updateTreeDeleteItem(req.body.file.parentID, req.body.file.id, req.session.dropboxfiles);
      req.session.dropboxfiles = util.insertItemIntoTree(req.body.file, req.body.parentID, req.session.dropboxfiles);
      next();
    })
  } else {
    next();
  }
};

Dropbox.deleteDropBoxFiles = function (req,res,next) {
  if(req.session.accessedClouds.dropbox) {
    DBoxApp.client(req.session.dbox_access_token).rm(req.body.options.id,function (status, data) {
      // TODO: error catch
      req.delete = true;
      next();
    })
  } else {
    next();
  }
};

Dropbox.downloadDropBoxFiles = function (req,res,next) {
  if(req.session.accessedClouds.dropbox) {
    var client = DBoxApp.client(req.session.dbox_access_token);
    var file = req.params.id;
    client.metadata(file, function (status, reply) {
      res.setHeader('Content-disposition', 'attachment; filename=' + file);
      res.setHeader('Content-type', reply.mime_type);
      client
        .stream(file)
        .pipe(res)
        .on('error', next);
    });
  } else {
    next();
  }
};

Dropbox.upload = function (req,res,next) {
  if(req.session.accessedClouds.dropbox) {
    DBoxApp.client(req.session.dbox_access_token).put('/'+req.files.file.originalname, req.fileStream, function (status, data) {
      // TODO: error catch
      next();
    })
  } else {
    next();
  }
};

export default Dropbox;
