const express = require('express');
const path = require('path');
const open = require('open');

const app = express();

app.use(express.static(__dirname + '/dist'));

app.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});
app.listen(4202, function(){
    console.log("your application is started on : http://localhost:4202/");
    console.log("Please do not close this Terminal Windows");
    open("http://localhost:4202/");
});