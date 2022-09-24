var https = require("https");
var url = require("url");

const interval = 10 * 60 * 1000; // 10 minutes * 60 seconds * 1000 milisec
var last_prevent = new Date();

module.exports = {
  preventSleep: function () {
    const now = new Date();
    const diff = (now - last_prevent) / interval;
    console.log(diff);
    if (diff > 1.0 ){
      last_prevent = now;
      https
      .get(`${process.env.LOCAL_URL}`, (resp) => {
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
    }
  },
};
