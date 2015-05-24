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
  self.on("cmdSessionStatus", self.handleCmdSessionStatus.bind(self));
  self.on("cmdNamingReply", self.handleCmdNamingReply.bind(self));
  self.session_options = i2putil.copyObj(self.session_options);
}
util.inherits(module.exports, Sam);

module.exports.prototype.session_options = {
  STYLE: 'STREAM',
  DESTINATION: 'TRANSIENT',
  ID: undefined
}

module.exports.prototype.connect = function (session_options, sam_options) {
  var self = this;

  i2putil.copyObj(session_options, self.session_options);
  Sam.prototype.connect.call(self, sam_options);
}

module.exports.prototype.handleCmdHelloReply = function (data) {
  var self = this;

  Sam.prototype.handleCmdHelloReply.call(self, data);

  var args = i2putil.copyObj(self.session_options);
  if (args.ID == undefined) {
    args.ID = 'AUTO_' + uuid();
  }
  self.ID = args.ID;

  self.sendCmd(['SESSION', 'CREATE'], args);
}

module.exports.prototype.handleCmdSessionStatus = function (data) {
  var self = this;

  self.PRIVKEY = data.DESTINATION;
  self.sendCmd(['NAMING', 'LOOKUP'], {NAME: 'ME'});
}

module.exports.prototype.handleCmdNamingReply = function (data) {
  var self = this;

  self.DESTINATION = data.VALUE;
  self.emit("connect");
}
