var express = require("express");
var redis = require('redis');
var app = express();

//TODO: create a redis client
var client = redis.createClient({
  host: 'localhost',
  port: 6379
});
client.on('error', err=> {
  console.log('Error ' + err);
});
// serve static files from public directory
app.use(express.static("public"));

// TODO: initialize values for: header, left, right, article and footer using the redis client
var layoutKeys = ['header', 'left', 'article', 'right', 'footer'];
layoutKeys.forEach(key => {
    client.set(key, 0);
});

// Get values for holy grail layout
function data() {
  let promises = layoutKeys.map(key => {
    return new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve({ [key]: Number(reply) });
        }
      });
    });
  });
  // TODO: uses Promise to get the values for header, left, right, article and footer from Redis
  return Promise.all(promises)
  .then(results => {
    return results.reduce((acc, cur) => Object.assign(acc, cur), {});
  });
}

// plus
app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);

  //TODO: use the redis client to update the value associated with the given key
  client.set(key, value, redis.print);
  res.send(`Updated ${key} to ${value}`);
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
