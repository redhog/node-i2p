var Session = require("../Session");
var Server = require("../Server");


server_session= new Session();
server_session.on('cmdSessionStatus', function (args) {
  console.log(["server_session.cmdSessionStatus", args]);

  var server = new Server();
  server.on('listening', function () {
    console.log(["server.listening", server_session.DESTINATION]);
  });
  server.on('connection', function (socket) {
    console.log("server.connection");

    socket.on('error', function (err) {
      console.log(["server.connection.error", err]);
      socket.end();
    });
    socket.on('end', function () {
      console.log("server.connection.end");
    });
    socket.on('data', function (data) {
      console.log(["server.connection.data", data]);
      socket.write("COPY: " + data + "\n");
    });

    socket.write("ORIG: Hello my children\n");
  });

  server.listen({ID: server_session.ID});
});
server_session.on("end", function (data) {
  console.log("server_session.end");
});
server_session.connect();
