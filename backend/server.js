
const express = require('express');
const app = require('./app');
const http = require('http');
const cors = require('cors')
const port = process.argv[2] || 4000;

const server = http.createServer(app);

server.listen(port, () => {
   console.log('Running server on port ' + port);
});