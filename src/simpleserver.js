/*
 * Description:
 * This script is the Node.js server for OpenROV.
 */

var CONFIG = require('./lib/config')
  , fs=require('fs')
  , express = require('express')
  , app = express()
  , server = app.listen(CONFIG.port)
  , io = require('socket.io').listen(server)
  , EventEmitter = require('events').EventEmitter
  , OpenROVController = require(CONFIG.OpenROVController)
  ;

app.use(express.static(__dirname + '/static/'));
process.env.NODE_ENV = true;

var globalEventLoop = new EventEmitter();
var controller = new OpenROVController(globalEventLoop);

app.get('/config.js', function(req, res) {
  res.type('application/javascript');
  res.send('var CONFIG = ' + JSON.stringify(CONFIG));
});

io.configure(function(){ io.set('log level', 1); });

var connections = 0;
io.sockets.on('connection', function (socket) {

	/* connection handling */
	connections += 1;
	if (connections == 1)
		controller.start();

	/* setup */
	socket.send('initialize');
	controller.updateSetting();
	setTimeout((function() {
		controller.requestSettings();
	}), 1000);
	controller.requestCapabilities();
	socket.emit('settings',CONFIG.preferences.get());
	socket.emit('videoStarted');

	/* web client socket handlers */
	socket.on('raw_command', function(command) {
		controller.rawCommand(command);
	});
	socket.on('disconnect', function(){
		connections -= 1;
		console.log('disconnect detected');
		if(connections === 0)
			controller.stop();
	});

	/* arduino controller handlers */
	controller.on('status',function(status){
		socket.volatile.emit('status',status);
	})
	controller.on('navdata',function(navdata){
		socket.volatile.emit('navdata',navdata);
	})
	controller.on('rovsys', function(data){
		socket.emit('rovsys',data);
	})
	controller.on('Arduino-settings-reported',function(settings){
		socket.emit('settings',settings);
		console.log('sending arduino settings to web client');
	})
	controller.on('settings-updated',function(settings){
		socket.emit('settings',settings);
		console.log('sending settings to web client');
	})
});

process.on('SIGTERM', function() {
	console.error('got SIGTERM, shutting down...');
	process.exit(0);
});

process.on('SIGINT', function() {
	console.error('got SIGINT, shutting down...');
	process.exit(0);
});

console.log('Started listening on port: ' + CONFIG.port);
