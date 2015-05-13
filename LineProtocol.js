var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");


module.exports = function() {
  var self = this;

  net.Socket.call(self);
  self.initLineProtocol();
}
util.inherits(module.exports, net.Socket);

module.exports.prototype.initLineProtocol = function () {
  var self = this;

  self.objId = uuid().slice(-10);

  self.on('error', self.handleError.bind(self));
  self.on('data', self.handleData.bind(self));

  self.options = i2putil.copyObj(self.options);
  self.receiveBuffer = "";
}


module.exports.prototype.options = {
  host: 'localhost',
  port: 0
};

module.exports.prototype.connect = function (options) {
  var self = this;

  i2putil.copyObj(options, self.options);
  net.Socket.prototype.connect.call(self, self.options, self.handleConnected.bind(self));
}

module.exports.prototype.reuseConn = function () {
  var self = this;

  self.removeAllListeners();
}

module.exports.prototype.handleData = function (data) {
  var self = this;

  self.receiveBuffer += data;
  if (self.receiveBuffer.indexOf("\n") >= 0) {
    lines = self.receiveBuffer.split("\n");
    self.receiveBuffer = lines.pop();
    lines.map(function (line) { self.emit("data-line", line)});
  }
}

module.exports.prototype.handleError = function (data) {
  var self = this;
  console.error([self.localAddress + ":" + self.localPort, data]);
}
