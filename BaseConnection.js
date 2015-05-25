var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var Sam = require("./Sam");



module.exports = function() {
  var self = this;

  Sam.call(this);
  self.on('cmdStreamStatus', self.handleCmdStreamStatus.bind(self));
  self.base_connection_options = i2putil.copyObj(self.base_connection_options);
}
util.inherits(module.exports, Sam);

module.exports.prototype.base_connection_options = {
  ID: undefined,
  DESTINATION: undefined
}

module.exports.prototype.connect = function (base_connection_options, sam_options) {
  var self = this;

  i2putil.copyObj(base_connection_options, self.base_connection_options);
  Sam.prototype.connect.call(self, sam_options);
}

module.exports.prototype.handleCmdHelloReply = function(data) {
  var self = this;

  Sam.prototype.handleCmdHelloReply.call(self, data);
  self.sendCmd(["STREAM", "CONNECT"], self.base_connection_options);
}

module.exports.prototype.handleCmdStreamStatus = function(data) {
  var self = this;
  client.reuseConn();

  self.emit("connect");
}
