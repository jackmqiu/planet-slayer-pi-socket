// var http = require('http').createServer(handler); //require http 
// server, and create server with function handler() var fs = 
// require('fs'); //require filesystem module
const io = require('socket.io-client');
const socket = io.connect("http://192.168.43.231:3000", {
    reconnection: true
})

const Gpio = require('onoff').Gpio;
let LED = new Gpio(4, 'out');
let inputDevice = new Gpio(17, 'in', 'rising',{debounceTimeout: 250});
// const redis = require('socket.io-redis');
// io.adapter(redis({ host: 'localhost', port: 3000 }));

// http.listen(8000, () => {
//   console.log('listening on *:8000');
// });

// function handler (req, res) { //create server
//   fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
//     if (err) {
//       res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
//       return res.end("404 Not Found");
//     }
//     res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
//     res.write(data); //write data from index.html
//     return res.end();
//   });
// }


const blinkLED = () => {
	if (LED.readSync() === 0) {
		LED.writeSync(1);
	} else {
		LED.writeSync(0);
	}
}


socket.on('connect', function () {
    console.log('connected to localhost:3000');
	console.log('id', socket.id);
    let lightVal = 0;
    inputDevice.watch(function (err, val) {
	console.log('trip');
	if (err) {
	   console.error('There was an error', err);
	   return;
	}
	socket.emit('shoot', val);
    });
    socket.on('shot', (data) => {
        console.log('message from the server:', data);
        socket.emit('serverEvent', "thanks server! for sending '" + data + "'");
	blinkLED();
    });
	
});

process.on('SIGINT', () => {
  LED.writeSync(0);
  LED.unexport();
  inputDevice.unexport();
  process.exit();
});
