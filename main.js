var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");
var sam = require("sam");

exports.sessions = {};

exports.getSession(options, cb) {
  if (exports.session[options.ID] != undefined) {
    cb(exports.session[options.ID]);
  } else {
    session = new sam.Session();
    session.on('cmdSessionStatus', function (data) {
      exports.session[options.ID] = session;
      cb(session);
    });
    session.connect(options);
  }
}

old_createConnection = net.createConnection;
net.connect = net.createConnection = function() {
  var args = net._normalizeConnectArgs(arguments);
  options = args[0];
  cb = args[1];

  if (options.DESTINATION != undefined) {
    var connection = new sam.Connection();

    getSession({options.STYLE:STYLE, ID:options.ID, DESTINATION:options.LOCAL_DESTINATION}, function (session) {
      connection.connect({ID:session.ID, DESTINATION:options.ID});
    });


  } else {
    return old_createConnection.apply(net, args);
  }
}
