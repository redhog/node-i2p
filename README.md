# node-i2p

This module implements the https://nodejs.org/api/net.html API for the https://geti2p.net/en/docs/api/samv3 protocol. That is, it enables talking to an i2p peer node using the same API normally used for talking to other nodes on the open internet.

Client usage:

    require("i2p");

    conn = i2p.createConnection({DESTINATION:"bmmkyafw6os62qd7g6rhmuewgnbrcaa3eykyrnjyggjgzoo3gb7q.b32.i2p"}, function () {
      console.log("Connected using local destination: " + conn.session.DESTINATION);
      conn.on("data", function (data) {
        console.log("Received: " + data.toString("utf-8"));
      });
      conn.write("Hello server");
    });


Server usage:

    require("i2p");

    var server = i2p.createServer();
    server.on('listening', function () {
      console.log("Listening using local destination: " + server.session.DESTINATION);
    });
    server.on('connection', function (client) {
      console.log("Client connected from destination: " + client.DESTINATION);

      client.on('data', function (data) {
        console.log("Received: " + data.toString("utf-8"));
      });

      client.write("Hello client\n");
    });

    server.listen({});