var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var BaseServer = require("./BaseServer");
var SessionManager = require("./SessionManager");

module.exports = function() {
  var self = this;

  BaseServer.call(this);
  self.forward_options = i2putil.copyObj(self.forward_options);
}
util.inherits(module.exports, BaseServer);

module.exports.prototype.forward_options = {
  // ID: undefined,
  // LOCAL_DESTINATION: undefined,
  // PORT: undefined,
  // HOST: undefined
}

module.exports.prototype.listen = function (forward_options, sam_options) {
  var self = this;

  i2putil.copyObj(forward_options, self.forward_options);

  var session_options = {};
  if (self.forward_options.ID != undefined) session_options.ID = self.forward_options.ID;
  if (self.forward_options.LOCAL_DESTINATION != undefined) session_options.DESTINATION = self.forward_options.LOCAL_DESTINATION;

  SessionManager.getSession(session_options, function (session) {
    self.session = session;
    base_forward_options = {ID: self.session.ID};
    if (self.forward_options.PORT != undefined) base_forward_options.PORT = self.forward_options.PORT;
    if (self.forward_options.HOST != undefined) base_forward_options.HOST = self.forward_options.HOST;
    BaseServer.prototype.listen.call(self, base_forward_options, sam_options);
  });
}

module.exports.prototype.handleEnd = function () {
  var self = this;

  BaseServer.prototype.handleEnd.call(this);
  SessionManager.releaseSession(self.session.ID);
}
