
const express = require('express');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const port = process.argv[2] || 3200;

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust this in production if necessary
        methods: ['GET', 'POST']
    }
});

// Attach NetDrop signaling logic
require('./api/sockets/netdrop.socket')(io);

server.listen(port, () => {
   console.log('Running server on port ' + port);
});