var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var LineProtocol = require("./LineProtocol");
var Sam = require("./Sam");



module.exports = function() {
  var self = this;

  Sam.call(this);
  self.connection_options = i2putil.copyObj(self.connection_options);
}
util.inherits(module.exports, Sam);

module.exports.prototype.connection_options = {
  ID: undefined,
  DESTINATION: undefined
}

module.exports.prototype.connect = function (connection_options, sam_options) {
  var self = this;

  i2putil.copyObj(connection_options, self.connection_options);
  Sam.prototype.connect.call(self, sam_options);
}

module.exports.prototype.handleCmdHelloReply = function(data) {
  var self = this;

  Sam.prototype.handleCmdHelloReply.call(self, data);
  self.sendCmd(["STREAM", "CONNECT"], self.connection_options);
}
