const http = require('http');
const app = require('./app');
const port = 1976;
// let allowedDomains = ['http://localhost:1976'];

const server = http.createServer(app);

server.listen(port, console.log('Server listening at port: ' + port));