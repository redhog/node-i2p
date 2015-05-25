var Session = require("../Session");
var Connection = require("../Connection");
var Server = require("../Server");

function setupClient(destination) {
  client = new Connection();
  client.on('connect', function (data) {
    console.log(["client.connect", data]);
    client.write("Hello NSA world\n");
  });
  client.on('data', function (data) {
    console.log(["client.data", data.toString("utf-8")]);
  });
  client.on("end", function (data) {
    console.log("client.end");
    client_session.end();
  });
  client.connect({DESTINATION: destination});
}



function setupServer() {
  var server = new Server();
  server.on('listening', function () {
    console.log(["server.listening", server.session.DESTINATION]);
    setupClient(server.session.DESTINATION);
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
      console.log(["server.connection.data", data.toString("utf-8")]);
      socket.write("COPY: " + data + "\n");
    });

    socket.write("ORIG: Hello my children\n");
    console.log("server.sendHelloWorld");
  });

  server.listen({});
}


setupServer();
