var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");

var BaseConnection = require("./BaseConnection");
var SessionManager = require("./SessionManager");



module.exports = function() {
  var self = this;

  BaseConnection.call(this);
  self.connection_options = i2putil.copyObj(self.connection_options);
}
util.inherits(module.exports, BaseConnection);

module.exports.prototype.connection_options = {
  // ID: undefined,
  // LOCAL_DESTINATION: undefined,
  DESTINATION: undefined
}

module.exports.prototype.connect = function (connection_options, sam_options) {
  var self = this;

  i2putil.copyObj(connection_options, self.connection_options);

  var session_options = {};
  if (self.connection_options.ID != undefined) session_options.ID = self.connection_options.ID;
  if (self.connection_options.LOCAL_DESTINATION != undefined) session_options.DESTINATION = self.connection_options.LOCAL_DESTINATION;

  SessionManager.getSession(session_options, function (session) {
    self.session = session;
    base_connection_options = {ID: self.session.ID, DESTINATION: connection_options.DESTINATION};
    BaseConnection.prototype.connect.call(self, base_connection_options, sam_options);
  });
}

module.exports.prototype.handleEnd = function() {
  var self = this;

  BaseConnection.prototype.handleEnd.call(self);
  SessionManager.releaseSession(self.session);
}