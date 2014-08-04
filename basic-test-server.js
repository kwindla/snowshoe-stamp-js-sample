//
// run this like so:
//
//   node basic-test-server.js <app key> <app secret> <port> <app callback>
//
// for example:
//
//   node basic-test-server.js 'adacd294fb89e9504239' '85be4456b70931ec815cb956bc03d020cc982658' 8080 /
//

var express = require('express');
var app = express ();

// the snowshoe callback comes in the form of a URL-encoded POST
// body. we need to set express up to parse that for us.
var bodyparser = require('body-parser');
app.use( bodyparser.urlencoded() ); // to support URL-encoded bodies

var snowshoe = require ('snowshoestamp');
var app_info = getSnowShoeAppInfoFromCmdLine ();
var auth = new snowshoe (app_info.app_key, app_info.app_secret);


app.get ('/', function (request, response) {
  response.send ('<a href="http://beta.snowshoestamp.com/applications/client/' +
                 app_info.app_key + 
                 '/">click here to try a stamp</a>');
});

app.post (app_info.callback, function (request, response) {
  auth.validateStamp (request.body, function (json_validation) {
    var validation = JSON.parse (json_validation);
    if (validation.error) {
      response.send ("error", validation);
    } else {
      response.send ("success", validation);
    }
  });
});


console.log ("listening on port", app_info.port);
app.listen (app_info.port);


function getSnowShoeAppInfoFromCmdLine () {
  var key = process.argv[2];
  var secret = process.argv[3];
  var port = process.argv[4];
  var callback = process.argv[5];
  if (! (key && secret && port && callback)) {
    console.log
      ("usage: node basic-test-server.js <app key> <app secret> <port>" +
       " <app callback>");
    process.exit (1);
  }
  return { app_key: key, app_secret: secret, port: port, callback: callback }
}
