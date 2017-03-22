var app       =     require("express")();
var mysql     =     require("mysql");
var http      =     require('http').Server(app);
var io        =     require("socket.io")(http);

/* Creating POOL MySQL connection.*/

var pool    =    mysql.createPool({
    connectionLimit   :   100,
    host              :   'localhost',
    user              :   'root',
    password          :   'admin',
    database          :   'sockets',
    debug             :   false
});

app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});


io.on('connection',function(socket){

    console.log("A user is connected");

    socket.on('status added',function(status){

        add_status(status,function(res){

            if(res){
                io.emit('refresh feed',status);
            } else {
                io.emit('error');
            }
        });
    });
});

var add_status = function (status,callback) {

    pool.getConnection(function(err,connection){

        if (err) {
            callback(false);
            return;
        }
        connection.query("INSERT INTO `fbstatus` (`s_text`) VALUES ('"+status+"')",function(err,rows){

            connection.release();

            if(!err) {
                callback(true);
            }
        });

        connection.on('error', function(err) {
            callback(false);
            return;
        });
    });
}


process.setMaxListeners(0);

http.listen(8080,function(){
    console.log("Listening on ",8080);
});