const dotenv = require('dotenv').config();

const http = require('http').createServer(handler); //require http server, and create server with function handler()
const fs = require('fs'); //require filesystem module
const io = require('socket.io-client');

http.listen(8080); //listen to port 8080

const socket = io.connect(`${process.env.SERVER}3000`, {
    reconnection: true
})

function handler (req, res) { //create server
  if (process.env.DEVICE_TYPE === 'gun') {
    socket.emit('shooting', process.env.PI_DEVICE_NUMBER);
  } else {
    socket.emit('hit', process.env.PI_DEVICE_NUMBER);
  }
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

 //GPIO

  const Gpio = require('onoff').Gpio;
  let LED = new Gpio(4, 'out');
  let maskDevice = new Gpio(6, 'in', 'rising',{debounceTimeout: 250});
  let chestPlateDevice = new Gpio(16, 'in', 'rising',{debounceTimeout: 250});
  let backPlateDevice = new Gpio(23, 'in', 'rising',{debounceTimeout: 250});
  let gunDevice = new Gpio(14, 'in', 'rising',{debounceTimeout: 250});


  const blinkLED = () => {

	LED.writeSync(1);
      setTimeout(() => {
        LED.writeSync(0);
      }, 1000);

  }




socket.on('connect', function () {
    console.log('connected to localhost:3000');
	  console.log('id', socket.id);
    socket.emit('initializeDevice', process.env.PI_DEVICE_NUMBER, process.env.DEVICE_TYPE);
    let lightVal = 0;
    // Shot registering
      maskDevice.watch(function (err, val) {
      	console.log('mask_hit');
      	if (err) {
      	   console.error('There was an error', err);
      	   return;
      	}
        // if (process.env.DEVICE_TYPE === 'gun') {
        //   socket.emit('shooting', process.env.PI_DEVICE_NUMBER);
        // } else {
          socket.emit('mask_hit', process.env.PI_DEVICE_NUMBER);
          blinkLED();
        // }
      });
      chestPlateDevice.watch((err, val) => {
        console.log('chest hit');
        socket.emit('chest_hit', process.env.PI_DEVICE_NUMBER);
        blinkLED();
      });
      backPlateDevice.watch((err, val) => {
        console.log('back hit');
        socket.emit('back_hit', process.env.PI_DEVICE_NUMBER);
        blinkLED();
      });
      gunDevice.watch((err, val) => {
        console.log('shooting');
        socket.emit('shooting', process.env.PI_DEVICE_NUMBER);
        blinkLED();
      })
    if (process.env.NODE_ENV === 'local') { //local test
      setTimeout(()=> socket.emit('shooting', process.env.PI_DEVICE_NUMBER), 1500);
    }
    socket.on('hit', (data) => {
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
    maskDevice.unexport();
    chestPlateDevice.unexport();
    backPlateDevice.unexport();
    gunDevice.unexport();
    process.exit();
  });
};
