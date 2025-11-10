const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();



const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// mongo pass=> 9imWxq2CQyrsPc28
const uri = "mongodb+srv://gariwala-taoshifPH:9imWxq2CQyrsPc28@cluster0.kpmcxd4.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// main route
app.get("/", (req, res) => {
  res.send(`🚗 GARIWALA server running on port ${port}`);
});

// database connection
async function run() {

}

run().catch(console.dir);

app.listen(port, () => console.log(`🚀 GARIWALA Server running at port ${port}`));
