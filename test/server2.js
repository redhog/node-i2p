const net = require("net");

const server = new net.Server();
server.on('listening', function () {
  console.log("server.listening");
});

// On new incoming client connection
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
  console.log("server.sendHelloWorld");
});
server.listen(4711);
