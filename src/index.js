const server = require('./server');

const port = process.env.PORT || 3000;

var sql = require("mssql");


// config for your database
const sqlConfig = {
    user: 'SA',
    password: 'Rootadmin123',
    database: 'chatapp',
    server: '52.229.101.201',
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  }
var bodyParser = require('body-parser')




server.create()
    .then(app => {

        // var http = require('http').Server(app);
        // var io = require('socket.io')(http);

        const http = require('http');
        const server = http.createServer(app);
        const { Server } = require("socket.io");
        const io = new Server(server);

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }))


        io.on('connection', (socket) => {
            console.log('a user is connected')
        })


        // sql.connect('Server=tcp:mysqlserver-chat-app.database.windows.net,1433;Database=chat-app;Uid=azureuser;Pwd=Rootadmin123;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30');
        // sql.connect('Server=tcp:52.229.101.201;database=chatapp;UID=SA;PWD=Rootadmin123');
        sql.connect(sqlConfig);

        app.get('/messages', (req, res) => {


                // create Request object
                let request = new sql.Request();

                // query to the database and get the records
                request.query('select * from Message', function (err, recordset) {

                    if (err) console.log(err)

                    // send records as a response
                    res.send(recordset.recordset);

                });
            
        })


        app.post('/messages', (req, res) => {


            console.log(req.body);

            let sql_query = `INSERT INTO MESSAGE (content,name) VALUES ('${req.body.content}', '${req.body.name}')`;


                // // create Request object
                let request = new sql.Request();

                // // query to the database and get the records
                request.query(sql_query, function (err, recordset) {

                    if (err) console.log(err)

                    io.emit('message', req.body);

                });
        })
        
            io.on('connection', (socket) => {
            console.log('a user is connected')
            })


        server.listen(port, () => {
            console.log(`Server has started on port ${port}!`);
        });



    }).catch(err => console.log(err));

