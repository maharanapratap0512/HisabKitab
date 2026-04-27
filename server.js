const express = require('express');
const path = require('path');
const open = require('open');
const port = process.argv[2] || 5000;

const app = express();

app.use(express.static(__dirname + '/dist'));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});
app.listen(port, '0.0.0.0', function () {
    console.log(`your application is started on : http://localhost:${port}/`);
    console.log("Please do not close this Terminal Windows");
    open(`http://localhost:${port}/`);
});