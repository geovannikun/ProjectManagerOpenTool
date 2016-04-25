module.exports = new function(){
    const md5 = require('md5');
    var config = {};

    this.init = function(){
        config.connection.use('ProjectManager');
        this.initAPI();
        this.initSite();
        this.initSockets();
        config.expressApp = config.expressApp.listen(config.port, () => console.info("Server Running on", config.port));
        config.socket.listen(config.expressApp);
    }.bind(this);

    this.setConfigs = function(obj){
        config = obj;
    }

    this.initAPI = function(){
        var app = config.expressApp;
        var r = config.r;
        var connection = config.connection;

        app.post('/api/login', (req, res) => {
            r.table('User').filter(r.row("username").eq(
                    req.body["username"]
                ).or(
                    r.row("email").eq(req.body["username"])
                ).and(
                    r.row("password").eq(md5(req.body["password"]))
                )
            ).run(connection).then(cursor => {
                cursor.toArray().then(results => {
                    if(results.length){
                        req.session.userID = results[0].id;
                        res.cookie('userID', results[0].id, { expires: new Date(Date.now() + 365000000000)});
                        res.json({success:true});
                    }else{
                        res.json({success:false});
                    }
                })
            }).error(err => { throw err });
        });

        app.delete('/api/login', (req, res) => {delete req.session.userID});

        app.post('/api/project/', (req, res) => {
            r.table('Project').get("users").contains(req.session.userID)
            .run(connection).then(
                cursor => cursor.toArray().then(results => res.json(results))
            ).error(err => { throw err });
        });

        app.get('/api/user/:userID*?', (req, res) => {
            var table = r.table('User');
            if(req.params.userID){
                table = table.filter({id:req.params.userID})
            }
            table.run(connection)
                .then(cursor => { cursor.toArray().then(results => res.json(results)) })
                .error(err => { throw err });
        });

        app.get('/api/project/:projectID*?', (req, res) => {
            var table = r.table('Project');
            if(req.params.projectID){
                table = table.filter({id:req.params.projectID})
            }
            table.run(connection)
                .then(cursor => { cursor.toArray().then(results => res.json(results)) })
                .error(err => { throw err });
        });

        app.get('/api/project/:projectID/board/:boardID*?', (req, res) => {
            var table = r.table('Board').filter({projectID:req.params.projectID})
            if(req.params.boardID){
                table = table.filter({id:req.params.boardID})
            }
            table.run(connection)
                .then(cursor => { cursor.toArray().then(results => res.json(results)) })
                .error(err => { throw err });
        });
    };

    this.initSite = function(){
        var app = config.expressApp;
        app.get('/project/:projectId/*', (req, res) => {
            res.sendFile(__dirname + '/public/index.html');
        });
        app.get('/login', (req, res) => {
            res.sendFile(__dirname + '/public/login.html');
        });
    };

    this.initSockets = function(){
        var app = config.expressApp;
        var r = config.r;
        var connection = config.connection;
        var io = config.socket;
        r.table('Board').changes().run(connection,
            (err, cursor) => !err && cursor.each(
                (err,result) => !err && io.emit("board:update", { [result.new_val.id] : diffObj(result.old_val, result.new_val) })
            )
        );
    };
}();

function diffObj(obj1,obj2){
    var obj = {};
    if(obj1 == null){
        obj = obj2;
    }else{
        for(prop in obj1){
            if(obj1[prop] != obj2[prop]){
                obj[prop] = obj2[prop];
            }
        }
    }
    return obj;
}
