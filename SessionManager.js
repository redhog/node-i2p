var Session = require("./Session");

function SessionManager() {
  var self = this;
  self.sessions = {};
}

SessionManager.prototype.getSession = function (args, cb) {
  /* args = {ID: nickname, DESTINATION: privkey} */

  var self = this;

  if (args.ID != undefined && self.sessions[args.ID] != undefined) {
    var session = self.sessions[args.ID];
    session.reference();
    cb(session);
  } else {
    var session = new Session();

    session.on('connect', function () {
      session.on("end", function (data) {
        delete self.sessions[session.ID];
      });
      self.sessions[session.ID] = session;
      cb(session);
    });
    session.connect(args);
  }
}

SessionManager.prototype.releaseSession = function (args) {
  var self = this;

  var session = self.sessions[args.ID];
  session.dereference();
}


module.exports = new SessionManager();
module.exports.SessionManager = SessionManager;
