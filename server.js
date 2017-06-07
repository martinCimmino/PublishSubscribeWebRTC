'use strict';

var express = require('express');
var app = express();
var http = require('http');
var server = require('http').Server(app);
var os = require('os');
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var bodyParser   = require('body-parser');
var session = require("client-sessions");
var fs = require('fs-extra');
var fileUpload = require('express-fileupload');

//Connect to db
mongoose.connect('mongodb://localhost/pubsub');
//Import the user schema
var User = require('./models/user');

app.use(express.static('public'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

//set the config of the session
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 100 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

//set the session in to the middleware
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ username: req.session.user.username }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

/*=======================================================
* ROUTES
*======================================================== 
*/

/*
*=============================================================
* Render the HTML page
*==============================================================
*/
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/home',requireLogin,  function (req, res) {
  res.sendFile(__dirname + '/home.html');
});

app.get('/profile', requireLogin, function (req, res) {
  res.sendFile(__dirname + '/profile.html');
});

app.get('/getUser', requireLogin, function( req, res){
  res.send(req.user);
});

/*
*=====================================================================
* Route for the user
*=====================================================================
*/
app.post('/signup', function(req,res) {
  var newuser= new User(req.body);
  newuser.save(function(err, user) {
    if (err) return console.error(err);
    send_msg(res, "Ok", "Registrazione effettuata! Ora effettua il login!");
  });
});

app.post('/login', function(req, res) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (!user) {
      send_msg(res,"ERROR", "Email o password non validi");
    } else {
      if (req.body.password === user.password) {
        req.session.user = user;
        send_msg(res,"Ok", "/profile");
      } else {
        send_msg(res,"ERROR", "Email o password non validi");
      }
    }
  });
});

app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.post('/updatePassword', requireLogin, function(req,res) {
  console.log(req.body);
  var new_password= req.body.new_password;
  User.findOne({ _id: req.body._id}, function(err, user) {
    user.password= new_password;
    user.save(function(err) {
      if (err) {
        console.error(err);
        return;
      }
      send_msg(res, "Ok", "Password aggiornata");
    });
  });
});

app.post('/updateImage', requireLogin, function(req,res) {
    var user_dir='./public/images/'+req.user._id;
    var url="";
    if (!fs.existsSync(user_dir)) {
      fs.mkdirSync(user_dir);
    }
    //if there are images..
    console.log(req.files);
    if(req.files) {
      for(var key in req.files) {
          url = user_dir + '/' + req.user.username + ".jpg";
          req.files[key].mv(url, function(err) {
            if (err) {
              console.log(err);
              send_msg(res, "ERROR", err);
              return;
            }
          });
      }
    }
    console.log(url);
    User.findOne({ "_id" : req.user._id}, function(err, user) {
      user.url_image= url;
      user.save(function(err) {
        if (err) {
          console.error(err);
          return;
        }
        send_msg(res, "Ok", "Immagine aggiornata");
      });
    });
});


function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
}

function send_msg(res, what, msg) {
    res.send({'status': what,
      'payload': msg
    });
}
//=============================================================
//=============================================================


/*
*===============================================================
* SIGNALING SERVER
*===============================================================
*/
var primoClient;

io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var numClients = io.sockets.sockets.length;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');
    
   if (numClients === 1) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      primoClient = socket.id;
      socket.emit('created', room, primoClient);
      //socket.emit('ready', room, primoClient);
    } else if (numClients > 1) {
      log('Client ID ' + socket.id + ' joined room ' + room + 'primoClient id:' + primoClient);
      // io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      //socket.emit('ready', room, primoClient);
     // socket.emit('ready', room, socket.id);
       io.sockets.in(room).emit('ready', room); // to all in the room


      //socket.broadcast.emit('ready', room); // to all except me
    } 
    else {
      socket.emit('full', room);
    }
  });

  // funzione che invia al client l'indirizzo pubblico del server (in locale non ci servirebbe)
  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });

});
//=================================================================
//=================================================================

//server listen at port 8080
server.listen(8080);
console.log("Server listen at port 8080");