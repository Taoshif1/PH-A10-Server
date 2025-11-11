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
  try {
    await client.connect();
    const db = client.db("gariwalaDB");
    const usersCollection = db.collection("users");
    const carsCollection = db.collection("cars");  // NEW
    const bookingsCollection = db.collection("bookings");  // NEW

    // ========== CAR ROUTES ==========
    
    // Get all cars
    app.get("/api/cars", async (req, res) => {
      try {
        const cars = await carsCollection.find().sort({ createdAt: -1 }).toArray();
        res.send({ success: true, cars });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // Get featured cars (6 newest)
    app.get("/api/cars/featured", async (req, res) => {
      try {
        const cars = await carsCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
        res.send({ success: true, cars });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // Get single car by ID
    app.get("/api/cars/:id", async (req, res) => {
      try {
        const car = await carsCollection.findOne({ _id: new ObjectId(req.params.id) });
        res.send({ success: true, car });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // Add new car
    app.post("/api/cars", async (req, res) => {
      try {
        const newCar = { ...req.body, createdAt: new Date(), status: 'available' };
        const result = await carsCollection.insertOne(newCar);
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // ✅ Ping MongoDB
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected successfully!");
  } finally {
    // await client.close(); // keep open during dev
  }
}

run().catch(console.dir);

app.listen(port, () => console.log(`🚀 GARIWALA Server running at port ${port}`));