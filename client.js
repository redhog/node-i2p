var LineProtocol = require("./LineProtocol");
var Sam = require("./Sam");
var Session = require("./Session");
var Connection = require("./Connection");

var ServerConnection = require("./ServerConnection");
var ForwardPort = require("./ForwardPort");
var Server = require("./Server");

client_session = new Session();
client_session.on('cmdSessionStatus', function (args) {
  console.log(["client_session.cmdSessionStatus", args]);


  client = new Connection();
  client.on('cmdStreamStatus', function (data) {
    console.log(["client.cmdStreamStatus", data]);
    client.reuseConn();
      console.log(["XXXX", client.receiveBuffer]);
    client.on('data', function (data) {
      console.log(["client.data", data]);
    });
    client.on("end", function (data) {
      console.log("client.end2");
      client_session.end();
    });

    client.write("Hello NSA world\n");
    console.log("client.sendHelloWorld");
  });
  client.on("end", function (data) {
    console.log("client.end");
    client_session.end();
  });
  client.connect({ID: client_session.ID, DESTINATION: process.argv[2]});


});
client_session.on("end", function (data) {
  console.log("client_session.end");
});
client_session.connect();
