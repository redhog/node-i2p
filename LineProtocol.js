var net = require('net');
var util = require('util');
var events = require("events");
var stream = require("stream");
var uuid = require("node-uuid");
var i2putil = require("./i2putil");


module.exports = function(conn) {
  var self = this;

  stream.Duplex.call(self);

  if (conn == undefined) {
    conn = new net.Socket();
  }
  self._conn = conn;

  self.objId = uuid().slice(-10);

  self._conn.on('error', self.handleError.bind(self));
  self._conn.on('data', self.handleData.bind(self));
  self._conn.on('end', self.handleEnd.bind(self));
  self.on('finish', self.handleFinish.bind(self));

  self.options = i2putil.copyObj(self.options);
  self.receiveBuffer = "";
  self.reused = false;

  self.references = 1;
}
util.inherits(module.exports, stream.Duplex);

module.exports.prototype.debug = false;

module.exports.prototype.options = {
  host: 'localhost',
  port: 0
};

module.exports.prototype.connect = function (options) {
  var self = this;

  i2putil.copyObj(options, self.options);
  self._conn.connect(self.options, self.handleConnected.bind(self));
}

module.exports.prototype.reuseConn = function () {
  var self = this;

  self.reused = true;
  if (self.receiveBuffer) {
    self.emit("data", self.receiveBuffer);
    self.receiveBuffer = "";
  }
}

module.exports.prototype.writeLine = function (line) {
  var self = this;

  self._conn.write(line + "\n");
}

module.exports.prototype.handleConnected = function () {
  var self = this;

  self.emit("connected");
}

module.exports.prototype.handleData = function (data) {
  var self = this;

  if (self.reused) {
    self.push(data);
  } else {
    self.receiveBuffer += data;
    if (self.receiveBuffer.indexOf("\n") >= 0) {
      lines = self.receiveBuffer.split("\n");
      self.receiveBuffer = lines.pop();
      lines.map(function (line) {
        self.emit("data-line", line);
      });
    }
  }
}

module.exports.prototype.handleError = function (data) {
  var self = this;

  if (self.debug) console.error([self._conn.localAddress + ":" + self._conn.localPort + ".error", data]);
  self.emit("error", data);
}

module.exports.prototype.handleEnd = function () {
  var self = this;

  if (self.debug) console.error([self._conn.localAddress + ":" + self._conn.localPort + ".end", data]);
  self.push(null);
}

module.exports.prototype.handleFinish = function () {
  var self = this;

  self._conn.end();
}

module.exports.prototype._read = function(size) {
}

module.exports.prototype._write = function (chunk, encoding, callback) {
  var self = this;

  self._conn.write(chunk, callback);
}

module.exports.prototype.reference = function () {
  var self = this;

  self.references++;
}

module.exports.prototype.dereference = function () {
  var self = this;

  self.references--;
  if (!self.references) {
    self.end();
  }
}
