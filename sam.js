var net = require('net');
var util = require('util');
var events = require("events");
var uuid = require("node-uuid");


function strToTitle(s) {
  s = s.toLowerCase();
  return s.slice(0,1).toUpperCase() + s.slice(1);
}

function copyObj(src, dst) {
  if (dst == undefined) dst = {};
  for (var key in src) {
    dst[key] = src[key];
  };
  return dst;
}



function Sam() {
  var self = this;

  net.Socket.call(this);

  self.options = copyObj(self.options);
  self.receiveBuffer = "";
}
util.inherits(Sam, net.Socket);

Sam.prototype.options = {
  host: 'localhost',
  port: 7656
};

Sam.prototype.connect = function (options) {
  var self = this;

  self.on('data', self.handleData.bind(self));
  self.on('end', self.handleEnd.bind(self));
  self.on('error', self.handleError.bind(self));

  copyObj(options, self.options);
  net.Socket.prototype.connect.call(self, self.options, self.handleConnected.bind(self));
}

Sam.prototype.reuseConn = function () {
  var self = this;

  self.removeAllListeners();
}

Sam.prototype.sendCmd = function (cmd, args) {
  var self = this;

  cmd = cmd.concat();
  for (var key in args) {
    cmd.push(key + "=" + args[key].toString());
  }

  cmd = cmd.join(' ');
  console.log("SEND: " + cmd);
  self.write(cmd + "\n")
}

Sam.prototype.handleConnected = function () {
  var self = this;

  self.sendCmd(['HELLO', 'VERSION'], {MIN:'2.0', MAX:'4.0'});
}

Sam.prototype.handleData = function (data) {
  var self = this;

  self.receiveBuffer += data;
  if (self.receiveBuffer.indexOf("\n") >= 0) {
    lines = self.receiveBuffer.split("\n");
    self.receiveBuffer = lines.pop();
    lines.map(self.handleLine.bind(self));
  }
}

Sam.prototype.handleLine = function (line) {
  var self = this;

  console.log('RECEIVED: ' + line);
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
      console.warn({cmd:cmd, args:args});
    self.emit('error', {cmd:cmd, args:args});
  } else {
    self.emit('cmd' + cmd.map(strToTitle).join(""), args);
  }
}

Sam.prototype.handleEnd = function (data) {
  var self = this;

  self.emit('end', data);
}

Sam.prototype.handleError = function (data) {
  console.error(data);
}

function Session() {
  var self = this;

  Sam.call(this);
  self.on('cmdHelloReply', self.handleCmdHelloReply.bind(self));
  self.session_options = copyObj(self.session_options);
}
util.inherits(Session, Sam);

Session.prototype.session_options = {
  STYLE: 'STREAM',
  DESTINATION: 'TRANSIENT',
  ID: undefined
}

Session.prototype.connect = function (session_options, sam_options) {
  var self = this;

  copyObj(session_options, self.session_options);
  Sam.prototype.connect.call(self, sam_options);
}

Session.prototype.handleCmdHelloReply = function (data) {
  var self = this;

  self.VERSION = data.VERSION;

  var args = copyObj(self.session_options);
  if (args.ID == undefined) {
    args.ID = 'AUTO_' + uuid();
  }
  self.ID = args.ID;

  self.sendCmd(['SESSION', 'CREATE'], args);
}
Session.prototype.handleCmdSessionStatus = function (data) {
  var self = this;

  self.DESTINATION = data.DESTINATION;
}



function Connection() {
  var self = this;

  Session.call(this);
  self.on('cmdSessionStatus', self.handleCmdSessionStatus.bind(self));
  self.connection_options = copyObj(self.connection_options);
}
util.inherits(Connection, Session);

Connection.prototype.connection_options = {
  DESTINATION: undefined
}

Connection.prototype.connect = function (connection_options, session_options, sam_options) {
  var self = this;

  copyObj(connection_options, self.connection_options);
  Session.prototype.connect.call(self, session_options, sam_options);
}

Connection.prototype.handleCmdSessionStatus = function(data) {
  var self = this;
  self.connection_options.ID = self.ID;
  self.sendCmd(['STREAM', 'CONNECT'], self.connection_options);
}



session_id = 'test' + uuid();
i = new Session();
i.on('cmdHelloReply', function (args) {
  console.log(["SESSION", "HELLO REPLY", args]);


  i = new Sam();
  i.on('cmdHelloReply', function (args) {
    var self = this;
    self.sendCmd(["STREAM", "CONNECT"], {DESTINATION: 'foo', ID: session_id});
  });
/*
  i.on('cmdStreamStatus', function (data) {
    console.log(["STREAM", 'cmdStreamStatus', data]);
  });
*/
  i.connect();


});
i.connect({ID:session_id});
