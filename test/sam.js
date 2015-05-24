var Session = require("../Session");
var Connection = require("../Connection");
var Server = require("../Server");

function setupClient(destination) {
  client_session = new Session();
  client_session.on('connect', function () {
    console.log("client_session.connect");


    client = new Connection();
    client.on('connect', function (data) {
      console.log(["client.connect", data]);
      client.write("Hello NSA world\n");
    });
    client.on('data', function (data) {
      console.log(["client.data", data]);
    });
    client.on("end", function (data) {
      console.log("client.end");
      client_session.end();
    });
    client.connect({ID: client_session.ID, DESTINATION: destination});


  });
  client_session.on("end", function (data) {
    console.log("client_session.end");
  });
  client_session.connect();
}



function setupServer() {
  server_session= new Session();
  server_session.on('connect', function () {
    console.log("server_session.connect");
    var server = new Server();
    server.on('listening', function () {
      console.log(["server.listening", server_session.DESTINATION]);
      setupClient(server_session.DESTINATION);
    });
    server.on('connection', function (socket) {
      console.log("server.connection");

      socket.on('error', function (err) {
        console.err(["server.connection.error", err]);
        socket.end();
      });
      socket.on('end', function () {
        console.err("server.connection.end");
      });
      socket.on('data', function (data) {
        console.log(["server.connection.data", data]);
        socket.write("COPY: " + data + "\n");
      });

      socket.write("ORIG: Hello my children\n");
      console.log("server.sendHelloWorld");
    });

    server.listen({ID: server_session.ID});
  });
  server_session.on("end", function (data) {
    console.log("server_session.end");
  });
  server_session.connect();
}


setupServer();
