var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var Sam = require("./Sam");
var ForwardPort = require("./ForwardPort");


module.exports = function() {
  var self = this;

  Sam.call(this);
  self.forward_options = i2putil.copyObj(self.forward_options);
  self.forward_port = new ForwardPort();

  self.forward_port.on('sam-connection', self.emit.bind(self, "connection"));

  self.on("end", self.handleEnd.bind(self));
}
util.inherits(module.exports, Sam);

module.exports.prototype.forward_options = {
  ID: undefined,
  PORT: undefined
  // , HOST: undefined
}

module.exports.prototype.listen = function (forward_options, sam_options) {
  var self = this;

  self.forward_port.listen({}, function () {
    var addr = self.address();

      console.log(['FORWARD PORT', addr]);

    i2putil.copyObj(forward_options, self.forward_options);
    self.forward_options.HOST = addr.address;
    self.forward_options.PORT = addr.port;

    Sam.prototype.connect.call(self, sam_options);
  });
}

module.exports.prototype.handleCmdHelloReply = function(data) {
  var self = this;

  Sam.prototype.handleCmdHelloReply.call(self, data);
  self.sendCmd(["STREAM", "FORWARD"], self.forward_options);
}
module.exports.prototype.handleCmdStreamStatus = function(data) {
  self.emit("listening");
}

module.exports.prototype.handleEnd = function () {
  var self = this;

  self.forward_port.end();
}
