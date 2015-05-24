var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var Sam = require("./Sam");
var ServerConnection = require("./ServerConnection");

module.exports = function() {
  var self = this;

  Sam.call(this);
  self.forward_options = i2putil.copyObj(self.forward_options);

  self.forward_port = new net.Server();
  self.forward_port.on('error', self.emit.bind(self, "error"));
  self.forward_port.on('connection', self.handleConnection.bind(self));

  self.on("cmdStreamStatus", self.emit.bind(self, "listening"));
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

  self.forward_port.listen(
    0, 'localhost',
    function () {
      var addr = self.forward_port.address();

      i2putil.copyObj(forward_options, self.forward_options);
      self.forward_options.HOST = addr.address;
      self.forward_options.PORT = addr.port;

      Sam.prototype.connect.call(self, sam_options);
    }
  );
}


module.exports.prototype.handleConnection = function (socket) {
  var self = this;

  server_connection = new ServerConnection(socket, function () {
    self.emit("connection", server_connection);
  });
};


module.exports.prototype.handleCmdHelloReply = function(data) {
  var self = this;

  Sam.prototype.handleCmdHelloReply.call(self, data);
  self.sendCmd(["STREAM", "FORWARD"], self.forward_options);
}

module.exports.prototype.handleEnd = function () {
  var self = this;

  self.forward_port.end();
}
