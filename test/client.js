var Session = require("../Session");
var Connection = require("../Connection");

client_session = new Session();
client_session.on('connect', function (args) {
  console.log("client_session.connect");


  client = new Connection();
  client.on('connect', function (data) {
    console.log(["client.connect", data]);

    client.write("Hello NSA world\n");
  });
  client.on('data', function (data) {
    console.log(["client.data", data]);
  });
  client.on("end", function (data) {
    console.log("client.end");
    client_session.end();
  });
  client.connect({ID: client_session.ID, DESTINATION: process.argv[2]});


});
client_session.on("end", function (data) {
  console.log("client_session.end");
});
client_session.connect();
