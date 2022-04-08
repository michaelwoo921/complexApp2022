const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

async function start() {
  const client = new MongoClient(process.env.CONNECTIONSTRING);
  await client.connect();
  module.exports = client;
  require('./app').listen(process.env.PORT);
}

start();
