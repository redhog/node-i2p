var i2p = require("i2p");


var server = i2p.createServer();
server.on('listening', function () {
  console.log("server.listening: " + server.session.DESTINATION);
});
server.on('connection', function (socket) {
  console.log("server.connection: " + socket.DESTINATION);

  socket.on('error', function (err) {
    console.error(["server.connection.error", err]);
    socket.end();
  });
  socket.on('end', function () {
    console.error("server.connection.end");
  });
  socket.on('data', function (data) {
    console.log("server.connection.data: " + data.toString("utf-8"));
    socket.write("COPY: " + data + "\n");
  });

  socket.write("ORIG: Hello my children\n");
  console.log("server.sendHelloWorld");
});

server.listen({});
