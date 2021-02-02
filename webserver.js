const dotenv = require('dotenv').config();

const http = require('http').createServer(handler); //require http server, and create server with function handler()
const fs = require('fs'); //require filesystem module
const io = require('socket.io-client');

http.listen(8080); //listen to port 8080

const socket = io.connect(`${process.env.SERVER}3000`, {
    reconnection: true
})

function handler (req, res) { //create server
  socket.emit('shoot', 1);
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}

if (process.env.NODE_ENV === 'pi') { //GPIO
  const Gpio = require('onoff').Gpio;
  let LED = new Gpio(4, 'out');
  let inputDevice = new Gpio(17, 'in', 'rising',{debounceTimeout: 250});


  const blinkLED = () => {
  	if (LED.readSync() === 0) {
  		LED.writeSync(1);
  	} else {
  		LED.writeSync(0);
  	}
  }
}



socket.on('connect', function () {
    console.log('connected to localhost:3000');
	  console.log('id', socket.id);
    socket.emit('initializePlayer', process.env.PI_DEVICE_NUMBER);
    let lightVal = 0;
    if (process.env.NODE_ENV === 'pi') { // Shot registering
      inputDevice.watch(function (err, val) {
      	console.log('trip');
      	if (err) {
      	   console.error('There was an error', err);
      	   return;
      	}
      	socket.emit('shoot', val);
      });
    } else if (process.env.NODE_ENV === 'local') { //local test
      setTimeout((testCode)=> socket.emit('shoot', testCode), 1500, 2);
    }
    socket.on('shot', (data) => {
        console.log('message from the server:', data);
        socket.emit('serverEvent', "thanks server! for sending '" + data + "'");
	      if (process.env.NODE_ENV === 'pi') {
          blinkLED();
        };
    });

});

if (process.env.NODE_ENV === 'pi') {
  process.on('SIGINT', () => {
    LED.writeSync(0);
    LED.unexport();
    inputDevice.unexport();
    process.exit();
  });
};
