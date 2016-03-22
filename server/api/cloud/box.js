var BoxClient = require('nodejs-box');
var querystring = require('querystring');
var request = require('request');
var fs = require('fs');
import util from '../../components/util';
var restler = require('restler');
var path = require('path');
var exec = require('child_process').exec;
import config from '../../config/environment';

var boxRedirect = process.env.boxRedirect || config.box.redirect;
var boxClientID = process.env.boxClientID || config.box.client_id;
var boxClientSecurityToken = process.env.boxClientSecurityToken || config.box.client_security_token;
var boxClientSecret = process.env.boxClientSecret||config.box.client_secret;


var Box = {}
Box.authorizeBox = function (req,res,next) {
  res.redirect("https://app.box.com/api/oauth2/authorize?response_type=code&client_id=" + boxClientID + "&state=" + boxClientSecurityToken + "&redirect_uri=" + boxRedirect);
};

Box.getBoxAccessToken = function (req,res,next) {
  var body = {grant_type:'authorization_code', code: req.query.code, client_id:boxClientID, client_secret:boxClientSecret, redirect_uri: boxRedirect};
  request.post({
    url: 'https://app.box.com/api/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: querystring.stringify(body)
  }, function (error, response, body) {
    // TODO: Error catch
    req.justAdded = 'box';
    req.session.box_access_token = JSON.parse(response.body).access_token;
    req.session.box_refresh_token = JSON.parse(response.body).refresh_token;
    if(req.session.accessedClouds) req.session.accessedClouds.box = true;
    else req.session.accessedClouds = {box:true};
    next();
  })
};

Box.getBoxFiles = function (req, res, next) {
  if(req.session.accessedClouds.box) {
    var box = new BoxClient({access_token: req.session.box_access_token,refresh_token: req.session.box_refresh_token});
    if (req.delete || req.rename) {
      var parentID = req.body.options.parentID;
    };
    var id = parentID || req.body.currentFolder || req.query.folderId || '0';
    box.folders.info(id, function (err, data) {
      // TODO: Error catch
      if(!req.session.boxfiles) {
        data.item_collection.entries.forEach(function(item) {
          item.parentID = id;
          if(item.type == 'folder')
            item.items = [];
        })
        req.session.boxfiles = {
          id: data.id,
          items: data.item_collection.entries,
          name: 'root',
          type: 'folder',
          parentID: id
        }
      } else {
        if(req.delete) {
          req.session.boxfiles = util.updateTreeDeleteItem(id, req.body.options.id, req.session.boxfiles);
        } else {
          data.item_collection.entries.forEach(function(item) {
            item.parentID = id;
            if(item.type == 'folder')
              item.items = [];
          })
          req.session.boxfiles = util.updateTreeWithNewPayLoad(id, data.item_collection.entries, req.session.boxfiles);
        }
      }
      res.redirect('http://localhost:8888')
    })
  } else {
    res.redirect('http://localhost:8888')
  }
};

Box.deleteBoxFiles = function (req, res, next) {
  if(req.session.accessedClouds.box) {
    var box = new BoxClient({access_token: req.session.box_access_token,refresh_token: req.session.box_refresh_token});
    box.files.delete(req.body.options.id, req.body.options.eTag, function(err, data) {
      // TODO: err catch
      req.delete = true;
      next();
    })
  } else {
    next();
  }
};

Box.updateBoxFileName = function (req, res, next) {
  if(req.session.accessedClouds.box) {
    var command = 'curl https://api.box.com/2.0/files/' + req.body.options.id + ' -H "Authorization: Bearer ' + req.session.box_access_token + '"' + " -d '" + JSON.stringify({name: req.body.options.title}) + "' -X PUT"
    child = exec(command, function(error, stdout, stderr){
      if(error !== null)
      {
        console.log('exec error: ' + error);
      } else {
        req.rename = true;
        next();
      }
    });
  } else {
    next();
  }
};
Box.moveBoxFile = function (req, res, next) {
  if(req.session.accessedClouds.box) {
    request({
      method: req.body.copy ? 'POST' : 'PUT',
      url: 'https://api.box.com/2.0/files/' + req.body.file.id + req.body.copy ? '/copy' : '',
      headers:{'Authorization': 'Bearer ' + req.session.box_access_token},
      body: querystring.stringify({parent: {id: req.body.parentID}})
    }, function (error, response, body) {
      if(!req.body.copy)
        req.session.boxfiles = util.updateTreeDeleteItem(req.body.file.parentID, req.body.file.id, req.session.boxfiles);
      req.session.boxfiles = util.insertItemIntoTree(req.body.file, req.body.parentID, req.session.boxfiles);
      next();
    });
  } else {
    next();
  }
};

Box.downloadBoxFiles = function (req, res, next) {
  if(req.session.accessedClouds.box) {
    res.setHeader('Content-disposition', 'attachment; filename=' + req.params.id);
    request({method:"GET",url:"https://api.box.com/2.0/files/"+req.params.id+'/content',
      headers:{'Authorization': 'Bearer ' + req.session.box_access_token}
    },function (err, response, body) {
      next();
    }).pipe(res).on('error', next);
  } else {
    next();
  }
};

Box.upload = function (req,res,next) {
  if(req.session.accessedClouds.box) {
    fs.stat(req.files.file.path, function (err, stats) {
      restler.post("https://upload.box.com/api/2.0/files/content", {
        headers:{'Authorization': 'Bearer ' + req.session.box_access_token},
        multipart: true,
        data: {
          "folder_id": "0",
          "filename": restler.file(path.join(req.files.file.path), req.files.file.originalname, stats.size, req.files.file.originalname, req.files.file.mimetype)
        }
      }).on("complete", function (err, response, body) {
          // TODO: Error catch
          // status code 409 signifies that a file with the same name is already in this folder, need to catch for this
          if(JSON.parse(response.statusCode)) {
            // repeat file name error catch here
          }
          next();
      });
    });
  } else {
    next();
  }
};

export default Box;
