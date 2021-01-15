// var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
const io = require('socket.io-client');
const socket = io.connect("http://localhost:3000/", {
    reconnection: true
})
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

socket.on('connect', function () {
    console.log('connected to localhost:3000');
    socket.on('clientEvent', function (data) {
        console.log('message from the server:', data);
        socket.emit('serverEvent', "thanks server! for sending '" + data + "'");
    });
});
