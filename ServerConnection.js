var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var LineProtocol = require("./LineProtocol");


module.exports = function(connectedCb) {
  var self = this;

  LineProtocol.call(self);
  self.initServerConnection(connectedCb);
}
util.inherits(module.exports, LineProtocol);

module.exports.convert = function(socket, connectedCb) {
  var self = socket;

  self.constructor = module.exports;
  self.__proto__ = module.exports.prototype;

  self.initLineProtocol();
  self.initServerConnection(connectedCb);

  return self;
}

module.exports.prototype.initServerConnection = function (connectedCb) {
  var self = this;
  self.connectedCb = connectedCb;
  self.on("data-line", self.handleLine.bind(self));
}

module.exports.prototype.handleLine = function (address) {
  var self = this;

  self.DESTINATION = address;
  self.reuseConn();
  self.connectedCb();
}

