const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const host = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.on('verb message', (msg) => {
        io.emit('verb message', msg);
        console.log('verb: ', msg);
    });
    socket.on('adjective message', (msg) => {
        io.emit('adjective message', msg);
        console.log('adjective: ', msg);
    });
    socket.on('noun message', (msg) => {
        io.emit('noun message', msg);
        console.log('noun: ', msg);
    });
});

http.listen(host, () => {
    console.log('listening on *3000');
});