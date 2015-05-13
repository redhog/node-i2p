var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var LineProtocol = require("./LineProtocol");


module.exports = function() {
  var self = this;

  LineProtocol.call(self);
  self.on('data-line', self.handleLine.bind(self));
  self.on('cmdHelloReply', self.handleCmdHelloReply.bind(self));
}
util.inherits(module.exports, LineProtocol);

module.exports.prototype.options = {
  host: 'localhost',
  port: 7656
};

module.exports.prototype.sendCmd = function (cmd, args) {
  var self = this;

  cmd = cmd.concat();
  for (var key in args) {
    cmd.push(key + "=" + args[key].toString());
  }

  cmd = cmd.join(' ');
  console.log(self.localAddress + ":" + self.localPort + ": SEND: " + cmd);
  self.write(cmd + "\n")
}

module.exports.prototype.handleLine = function (line) {
  var self = this;

  console.log(self.localAddress + ":" + self.localPort + ': RECEIVED: ' + line);
  var items = line.match(/[^ "]*="(.*)"|([^ "]+)/g);
  var cmd = items.slice(0, 2);
  var args = {};
  items.slice(2).map(function (arg) {
    var pos = arg.indexOf("=");
    var key = arg.slice(0, pos);
    var value = arg.slice(pos + 1);
    args[key] = value;
  });
  if (args.RESULT != undefined && args.RESULT != 'OK') {
    self.emit('error', {cmd:cmd, args:args});
  } else {
    self.emit('cmd' + cmd.map(i2putil.strToTitle).join(""), args);
  }
}

module.exports.prototype.handleConnected = function () {
  var self = this;

  self.sendCmd(['HELLO', 'VERSION'], {MIN:'2.0', MAX:'4.0'});
}

module.exports.prototype.handleCmdHelloReply = function (data) {
  var self = this;

  self.VERSION = data.VERSION;
}
