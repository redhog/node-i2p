var Session = require("../Session");
var Connection = require("../Connection");

client = new Connection();
client.on('connect', function () {
  console.log("client.connect");

  client.write("Hello NSA world\n");
});
client.on('data', function (data) {
  console.log("client.data: " + data.toString("utf-8"));
});
client.on("end", function (data) {
  console.log("client.end");
  client_session.end();
});
client.connect({DESTINATION: process.argv[2]});
