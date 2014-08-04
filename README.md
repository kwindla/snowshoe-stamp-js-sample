snowshoe-stamp-js-sample
========================

So you have some SnowShoe stamps and you want to write a node.js application that makes use of them. Cool! This is sample code to get you started.

the basics
----------

Clone this repo, cd into the directory, do an `npm install`, and then you should be able to run a very basic test server.

    node basic-test-server.js <app key> <app secret> <port> <app callback>

For example:

    node basic-test-server.js 'adacd294fb89e9504239' '85be4456b70931ec815cb956bc03d020cc982658' 8080 /

Now point a phone or tablet browser at the server you just spun up.

    http://my.server:8080/
    
minimal working server-side code
---------------------

We're relying on the [snowshoestamp](https://github.com/mattnull/node-snowshoe-stamp) package to do the heavy lifting of communicating with the SnowShoe API server. All we need to do is set up some routing and validation logic.

```javascript
var express = require('express');
var app = express ();

// the snowshoe callback comes in the form of a URL-encoded POST
// body. we need to set express up to parse that for us.
var bodyparser = require ('body-parser');
app.use ( bodyparser.urlencoded() );

var snowshoe = require ('snowshoestamp');
var app_info = getSnowShoeAppInfoFromCmdLine ();
var auth = new snowshoe (your_app_key, your_app_secret);

app.get ('/', function (request, response) {
  response.send ('<a href="http://beta.snowshoestamp.com/applications/client/' +
                 your_app_key + 
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

```

and a more substantial example
----

Our second example, `stamp-image.demo.js` takes the same command-line arguments as `basic-test-server.js`.

This demo displays photos that have been associated with a particular stamp. You can upload photos from your phone or mobile device. (Or you can test from a desktop browser by supplying a stamp serial string in a url query argument.)

The [stamp-image-demo.js](https://github.com/kwindla/snowshoe-stamp-js-sample/blob/master/stamp-image-demo.js) server-side logic shows one way to pass stamp validation information into html templates. Check the comments for more details. And, to complete the picture, [views/main.html](https://github.com/kwindla/snowshoe-stamp-js-sample/blob/master/views/main.html) makes use of the stamp validation data from both (templated) HTML and JavaScript.

setting up on Amazon AWS EC2
----

The following commands should get you up and running on a clean Amazon Linux virtual machine instance. (This was tested on `amzn-ami-hvm-2014.03.2.x86_64-ebs (ami-d13845e1)`.)

```bash
sudo rpm --import https://fedoraproject.org/static/0608B895.txt
sudo rpm -Uvh http://download-i2.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
sudo yum install nodejs npm --enablerepo=epel
sudo yum install git
git clone https://github.com/kwindla/snowshoe-stamp-js-sample.git
cd snowshoe-stamp-js-sample/
npm install
```

Remember to make sure that this machine instance's security group allows traffic into whatever port your node.js server is listening on. And also make sure that your SnowShoe application callback points to the public IP address (or DNS name) of the server.

