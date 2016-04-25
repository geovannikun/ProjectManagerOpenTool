const express = require("express");
const http = require('http');
const session = require('express-session');
const web = require('./initMethods.js');
const bodyParser = require('body-parser');
const r = require("rethinkdb");
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = 8181;
const dbConfig = {host: 'localhost', port: 28015};

app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'ProjectManager'
}));

app.use(function (req, res, next) {
    if((req.url.indexOf("login") == -1) && !req.session.userID){
        res.redirect('/login');
    }else{
        next();
    }
});

r.connect(dbConfig)
    .then(conn => startServer(conn))
    .error(err => { throw err });

function startServer(conn){
    web.setConfigs({
        expressApp : app,
        r: r,
        connection: conn,
        port: port,
        socket: io
    });
    web.init();
}
