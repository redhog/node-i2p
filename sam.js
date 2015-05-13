var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var LineProtocol = require("./LineProtocol");
var Sam = require("./Sam");
var Session = require("./Session");
var Connection = require("./Connection");

var ServerConnection = require("./ServerConnection");
var ForwardPort = require("./ForwardPort");
var Server = require("./Server");


session_id = 'test' + uuid();
i = new Session();
i.on('cmdSessionStatus', function (args) {
  console.log(["SESSION", "HELLO REPLY", args]);


  i2 = new Connection();
  i2.on('cmdStreamStatus', function (data) {
    console.log(["STREAM", 'cmdStreamStatus', data]);
  });
  i2.on("end", function (data) {
    console.log("CLOSED INNER");
    i.end();
  });
  i2.connect({ID: i.ID, DESTINATION: "foo"});


});
i.on("end", function (data) {
  console.log("CLOSED OUTER");
});
i.connect();
