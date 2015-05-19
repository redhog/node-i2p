var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var LineProtocol = require("./LineProtocol");
var ServerConnection = require("./ServerConnection");


module.exports = function() {
  var self = this;

  self.objId = uuid().slice(-10);

  net.Server.call(self);

  self.on('error', self.handleError.bind(self));
  self.on('connection', self.handleConnection.bind(self));

  self.options = i2putil.copyObj(self.options);
}
util.inherits(module.exports, net.Server);

module.exports.prototype.options = {
  host: 'localhost',
  port: 0
};

module.exports.prototype.handleError = LineProtocol.prototype.handleError;

module.exports.prototype.listen = function (options, cb) {
  var self = this;

  i2putil.copyObj(options, self.options);
  // FIXME: Node 0.12 makes it possible to send self.options and cb straight to listen(), but I'm running 0.10 :(
  if (cb) self.on("listening", cb);
  net.Server.prototype.listen.call(self, self.options.port, self.options.host);
}

module.exports.prototype.handleConnection = function (socket) {
  var self = this;

  ServerConnection.convert(socket, function () {
    self.emit("sam-connection", socket);
  });
};

