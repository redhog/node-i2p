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


function LineProtocol() {
  var self = this;

  net.Socket.call(self);
  self.initLineProtocol();
}
util.inherits(LineProtocol, net.Socket);

LineProtocol.prototype.initLineProtocol = function () {
  var self = this;

  self.objId = uuid().slice(-10);

  self.on('error', self.handleError.bind(self));
  self.on('data', self.handleData.bind(self));

  self.options = copyObj(self.options);
  self.receiveBuffer = "";
}


LineProtocol.prototype.options = {
  host: 'localhost',
  port: 0
};

LineProtocol.prototype.connect = function (options) {
  var self = this;

  copyObj(options, self.options);
  net.Socket.prototype.connect.call(self, self.options, self.handleConnected.bind(self));
}

LineProtocol.prototype.reuseConn = function () {
  var self = this;

  self.removeAllListeners();
}

LineProtocol.prototype.handleData = function (data) {
  var self = this;

  self.receiveBuffer += data;
  if (self.receiveBuffer.indexOf("\n") >= 0) {
    lines = self.receiveBuffer.split("\n");
    self.receiveBuffer = lines.pop();
    lines.map(function (line) { self.emit("data-line", line)});
  }
}

LineProtocol.prototype.handleError = function (data) {
  var self = this;
  console.error([self.localAddress + ":" + self.localPort, data]);
}





function Sam() {
  var self = this;

  LineProtocol.call(self);
  self.on('data-line', self.handleLine.bind(self));
  self.on('cmdHelloReply', self.handleCmdHelloReply.bind(self));
}
util.inherits(Sam, LineProtocol);

Sam.prototype.options = {
  host: 'localhost',
  port: 7656
};

Sam.prototype.sendCmd = function (cmd, args) {
  var self = this;

  cmd = cmd.concat();
  for (var key in args) {
    cmd.push(key + "=" + args[key].toString());
  }

  cmd = cmd.join(' ');
  console.log(self.localAddress + ":" + self.localPort + ": SEND: " + cmd);
  self.write(cmd + "\n")
}

Sam.prototype.handleLine = function (line) {
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
    self.emit('cmd' + cmd.map(strToTitle).join(""), args);
  }
}

Sam.prototype.handleConnected = function () {
  var self = this;

  self.sendCmd(['HELLO', 'VERSION'], {MIN:'2.0', MAX:'4.0'});
}

Sam.prototype.handleCmdHelloReply = function (data) {
  var self = this;

  self.VERSION = data.VERSION;
}



function Session() {
  var self = this;

  Sam.call(this);
  self.on("cmdSessionStatus", self.handleCmdSessionStatus.bind(self));
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

  Sam.prototype.handleCmdHelloReply.call(self, data);

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

  Sam.call(this);
  self.connection_options = copyObj(self.connection_options);
}
util.inherits(Connection, Sam);

Connection.prototype.connection_options = {
  ID: undefined,
  DESTINATION: undefined
}

Connection.prototype.connect = function (connection_options, sam_options) {
  var self = this;

  copyObj(connection_options, self.connection_options);
  Sam.prototype.connect.call(self, sam_options);
}

Connection.prototype.handleCmdHelloReply = function(data) {
  var self = this;

  Sam.prototype.handleCmdHelloReply.call(self, data);
  self.sendCmd(["STREAM", "CONNECT"], self.connection_options);
}



function Server() {
  var self = this;

  Sam.call(this);
  self.forward_options = copyObj(self.forward_options);
  self.forward_port = new ForwardPort();

  self.on("end", self.handleEnd.bind(self));
}
util.inherits(Server, Sam);

Server.prototype.forward_options = {
  ID: undefined,
  PORT: undefined
  // , HOST: undefined
}

Server.prototype.listen = function (forward_options, sam_options, cb) {
  var self = this;

  self.forward_port.listen({}, function () {
    var addr = self.forward_port.server.address();

    copyObj(forward_options, self.forward_options);
    self.forward_options.HOST = addr.address;
    self.forward_options.PORT = addr.port;

    Sam.prototype.connect.call(self, sam_options);
  });
}

Server.prototype.handleCmdHelloReply = function(data) {
  var self = this;

  Sam.prototype.handleCmdHelloReply.call(self, data);
  self.sendCmd(["STREAM", "FORWARD"], self.forward_options);
}

Server.prototype.handleEnd = function () {
  var self = this;

  self.forward_port.end();
}


function ForwardPort() {
  var self = this;

  self.objId = uuid().slice(-10);

  net.Server.call(self);

  self.on('error', self.handleError.bind(self));
  self.on('connection', self.handleConnection.bind(self));

  self.options = copyObj(self.options);
}
util.inherits(ForwardPort, net.Server);

ForwardPort.prototype.options = {
  host: 'localhost',
  port: 0
};

ForwardPort.prototype.listen = function (options, cb) {
  var self = this;

  copyObj(options, self.options);
  net.Server.prototype.connect.call(self, self.options, cb);
}

ForwardPort.prototype.handleConnection = function (socket) {
  var self = this;

  self.emit("sam-connection", ServerConnection.convert(socket));
};



function ServerConnection(connectedCb) {
  var self = this;

  LineProtocol.call(self);
  self.initServerConnection(connectedCb);
}
util.inherits(ServerConnection, LineProtocol);

ServerConnection.convert = function(socket, connectedCb) {
  var self = socket;

  self.constructor = ServerConnection;
  self.__proto__ = ServerConnection.prototype;

  self.initLineProtocol();
  self.initServerConnection(connectedCb);

  return self;
}

ServerConnection.prototype.initServerConnection = function (connectedCb) {
  var self = this;
  self.connectedCb = connectedCb;
  self.on("data-line", self.handleLine.bind(self));
}

ServerConnection.prototype.handleLine = function (address) {
  var self = this;

  self.DESTINATION = address;
  self.reuseConn();
  self.connectedCb();
}




session_id = 'test' + uuid();
i = new Session();
i.on('cmdSessionStatus', function (args) {
  console.log(["SESSION", "HELLO REPLY", args]);


  i2 = new Connection();
  i2.on('cmdStreamStatus', function (data) {
    console.log(["STREAM", 'cmdStreamStatus', data]);
  });
  i2.on("end", function (data) {
    console.log("CLOSED INNER");
    i.end();
  });
  i2.connect({ID: i.ID, DESTINATION: "foo"});


});
i.on("end", function (data) {
  console.log("CLOSED OUTER");
});
i.connect();
