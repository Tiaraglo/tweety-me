// require('dotenv').config()
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

const { MongoClient } = require("mongodb");

const url = process.env.MONGODB_URI;
const client = new MongoClient(url);

const db_Name = "gc1";

async function mongoConnect() {
  try {
    await client.connect();
    console.log("MongoDB Connected successfully to server");
    // return 'done'
  } catch (error) {
    console.log("MongoDB connection error ", error);
    throw error;
  }
}

const getDatabase = () => {
  return client.db(db_Name);
};

module.exports = {
  mongoConnect,
  getDatabase,
};
