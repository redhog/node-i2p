const net = require('net'),
      util = require('util'),
      events = require('events'),
      uuid = require('uuid');
const i2putil = require("./i2putil");

const LineProtocol = require("./LineProtocol");


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

