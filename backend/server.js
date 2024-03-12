
const express = require('express');
const app = require('./app');
const http = require('http');
const port = process.argv[2] || 50220;

const server = http.createServer(app);

server.listen(port, () => {
   console.log('Running server on port ' + port);
});