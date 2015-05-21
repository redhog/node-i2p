# node-i2p

This module implements the https://nodejs.org/api/net.html API for the https://geti2p.net/en/docs/api/samv3 protocol. That is, it enables talking to an i2p peer node using the same API normally used for talking to other nodes on the open internet.

Usage:

    require("i2p");
    net = require("i2p");

    conn = net.createConnection({DESTINATION:"long i2p destination string"}, function () {
      console.log("connected");
      conn.on("data", function (data) {
        console.log("Received: " + data);
      });
      conn.write("Hello other end");
    });
