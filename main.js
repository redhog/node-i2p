const net = require('net'),
      util = require('util'),
      events = require('events'),
      uuid = require('uuid');

const Server = require("./Server");
const Connection = require("./Connection");

module.exports.createConnection = function(options, cb) {
  var connection = new Connection();
  if (cb) connection.on("connect", cb);
  connection.connect(options);
  return connection;
}

module.exports.createServer = function(options, connectionListener) {
  // Right now options are not used, only provided for compatibility with the net module

  if (typeof options == 'function') {
    connectionListener = options;
    options = {};
  }

  var server = new Server();
  if (connectionListener) server.on("connection", connectionListener);
  return server;
}
