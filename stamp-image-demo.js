//
// run this like so:
//
//   node stamp-image-demo.js <app key> <app secret> <port> <app callback>
//
// for example:
//
//   node stamp-image.demo.js 'adacd294fb89e9504239' '85be4456b70931ec815cb956bc03d020cc982658' 8080 /
//

var express = require('express');
var app = express ();

// the snowshoe callback comes in the form of a URL-encoded POST
// body. we need to set express up to parse that for us.
var bodyparser = require ('body-parser');
app.use (bodyparser.urlencoded ());

// setup our snowshoe module so we can validate tag information in our
// app callback
var snowshoe = require ('snowshoestamp');
var app_info = getSnowShoeAppInfoFromCmdLine ();
var auth = new snowshoe (app_info.app_key, app_info.app_secret);

// use handlebars as our view engine
var hbs = require ('hbs');
app.set ('view engine', 'html');
app.engine ('html', hbs.__express);

// we're going to cache the images in-memory. we wouldn't do this for
// anything other than a demo-esque bit of sample code. restart the
// server and you lose what's been uploaded!
var images = {};


// home page handler. we can test by manually loading with a
// ?serial=STAMPID query string. for example:
// 
//   http://my.server:8080/?serial=DEV-STAMP
//
app.get ('/', function (request, response) {
  response.render ('main', {stamp: {serial: request.query.serial},
                            app_key: app_info.app_key});
});

// snowshoe app callback handler. for this demo, it makes sense to set
// this to your root url, so you're always just requesting
// "http://my.server/" ... but it doesn't really matter
//
app.post (app_info.callback, function (request, response) {
  auth.validateStamp (request.body, function (json_validation) {
    var validation = JSON.parse (json_validation);
    validation.app_key = app_info.app_key;
    if (validation.error) {
      response.send ("error", validation);
    } else {
      response.render ('main', validation);
    }
  });
});

// image upload handler
//
app.post ('/image', function (request, response) {
  var buf = new Buffer (parseInt (request.headers['content-length']));
  var offs = 0;
  request.on ('data', function(chunk) {
    // console.log ('got %d bytes of data', chunk.length);
    chunk.copy (buf, offs, 0);
    offs += chunk.length
  });
  console.log ("got an image post", request.query);
  images[request.query.serial] = { type: request.query.type,
                                   bytes: buf };
  response.send ("okay");
});

// image get request handler
//
app.get ('/image', function (request, response) {
  var img = images[request.query.serial];
  if (!img) {
    console.log ("image request not found", request.query);
    response.status(404).send ("not found");
  } else {
    console.log ("image request", request.query);
    response.set ({'Content-Type': img.type,
                   'Cache-Control': 'max-age=0, must-revalidate'});
    response.send (img.bytes);
  }
});


// and let's start this rodeo ...
//
console.log ("listening on port", app_info.port);
app.listen (app_info.port);


// ----

function getSnowShoeAppInfoFromCmdLine () {
  var key = process.argv[2];
  var secret = process.argv[3];
  var port = process.argv[4];
  var callback = process.argv[5];
  if (! (key && secret && port && callback)) {
    console.log
      ("usage: node stamp-image-demo.js <app key> <app secret> <port>" +
       " <app callback>");
    process.exit (1);
  }
  return { app_key: key, app_secret: secret, port: port, callback: callback }
}
