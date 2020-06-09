var https = require("https");
var url = require("url");

module.exports = {
  preventSleep: function () {
    https
      .get("https://bobs-queue-bot.herokuapp.com/", (resp) => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          console.log("Preveting sleep");
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });
  },
};
