var i2p = require("i2p");
var Session = require("../Session");
var Connection = require("../Connection");

function setupClient(server) {
  var count = 0;
  client = i2p.createConnection({DESTINATION: server.session.DESTINATION}, function () {
    console.log("client.connect");
    client.write("Hello NSA world\n");
  });
  client.on('data', function (data) {
    console.log("client.data: " + data.toString("utf-8"));
    count++;
    if (count > 1) client.end();
  });
  client.on("end", function (data) {
    console.log("client.end");
    server.end();
  });
}



function setupServer() {
  var server = i2p.createServer();
  server.on('listening', function () {
    console.log("server.listening: " + server.session.DESTINATION);
    setupClient(server);
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
}


setupServer();
