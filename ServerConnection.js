var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var LineProtocol = require("./LineProtocol");


module.exports = function(conn, connectedCb) {
  var self = this;

  LineProtocol.call(self, conn);

  self.connectedCb = connectedCb;
  self.on("data-line", self.handleLine.bind(self));
}
util.inherits(module.exports, LineProtocol);

module.exports.prototype.handleLine = function (address) {
  var self = this;

  self.DESTINATION = address;
  self.reuseConn();
  self.connectedCb();
}

