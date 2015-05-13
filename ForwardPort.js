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

module.exports.prototype.listen = function (options, cb) {
  var self = this;

  i2putil.copyObj(options, self.options);
  net.Server.prototype.connect.call(self, self.options, cb);
}

module.exports.prototype.handleConnection = function (socket) {
  var self = this;

  self.emit("sam-connection", ServerConnection.convert(socket));
};
