const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kpmcxd4.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
let db;
let carsCollection;
let bookingsCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("gariwalaDB");
    carsCollection = db.collection("cars");
    bookingsCollection = db.collection("bookings");
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

connectDB();

// ========================================
// 🏠 ROOT ROUTE
// ========================================
app.get("/", (req, res) => {
  res.send({
    message: "🚗 GARIWALA Server is Running!",
    status: "active",
    endpoints: {
      allCars: "GET /cars",
      featuredCars: "GET /cars/featured",
      singleCar: "GET /cars/:id",
      userCars: "GET /cars/user/:email",
      addCar: "POST /cars",
      updateCar: "PUT /cars/:id",
      deleteCar: "DELETE /cars/:id",
      userBookings: "GET /bookings/user/:email",
      createBooking: "POST /bookings",
    },
  });
});

// ========================================
// 🚗 CAR ROUTES
// ========================================

// Get ALL cars
app.get("/cars", async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    // Search by car name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const cars = await carsCollection.find(query).sort(sortOption).toArray();

    res.send({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch cars",
      error: error.message,
    });
  }
});

// Get FEATURED cars (6 newest)
app.get("/cars/featured", async (req, res) => {
  try {
    const cars = await carsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.send({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch featured cars",
      error: error.message,
    });
  }
});

// Get cars by USER email (My Listings)
app.get("/cars/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const cars = await carsCollection
      .find({ providerEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.send({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("Error fetching user cars:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch user cars",
      error: error.message,
    });
  }
});

// Get SINGLE car by ID
app.get("/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await carsCollection.findOne({ _id: new ObjectId(id) });

    if (!car) {
      return res.status(404).send({
        success: false,
        message: "Car not found",
      });
    }

    res.send({
      success: true,
      car,
    });
  } catch (error) {
    console.error("Error fetching car details:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch car details",
      error: error.message,
    });
  }
});

// ADD new car (POST)
app.post("/cars", async (req, res) => {
  try {
    const newCar = {
      ...req.body,
      status: "available",
      rating: 4.5,
      createdAt: new Date(),
    };

    const result = await carsCollection.insertOne(newCar);

    res.status(201).send({
      success: true,
      message: "Car added successfully!",
      carId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).send({
      success: false,
      message: "Failed to add car",
      error: error.message,
    });
  }
});

// UPDATE car by ID (PUT)
app.put("/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid car ID",
      });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated
    delete updatedData.providerEmail;
    delete updatedData.providerName;
    delete updatedData.createdAt;
    delete updatedData._id;

    const result = await carsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Car not found",
      });
    }

    res.send({
      success: true,
      message: "Car updated successfully!",
    });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).send({
      success: false,
      message: "Failed to update car",
      error: error.message,
    });
  }
});

// DELETE car by ID (DELETE)
app.delete("/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid car ID",
      });
    }

    const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Car not found",
      });
    }

    res.send({
      success: true,
      message: "Car deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).send({
      success: false,
      message: "Failed to delete car",
      error: error.message,
    });
  }
});

// ========================================
// 📅 BOOKING ROUTES
// ========================================

// Get user bookings
app.get("/bookings/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await bookingsCollection
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.send({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// Create booking (POST)
app.post("/bookings", async (req, res) => {
  try {
    const { carId } = req.body;

    // Check if car exists and is available
    const car = await carsCollection.findOne({ _id: new ObjectId(carId) });

    if (!car) {
      return res.status(404).send({
        success: false,
        message: "Car not found",
      });
    }

    if (car.status === "booked") {
      return res.status(400).send({
        success: false,
        message: "Car is already booked!",
      });
    }

    // Create booking
    const newBooking = {
      ...req.body,
      carName: car.name,
      carImage: car.image,
      rentPrice: car.price,
      status: "confirmed",
      createdAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    // Update car status to booked
    await carsCollection.updateOne(
      { _id: new ObjectId(carId) },
      { $set: { status: "booked" } }
    );

    res.status(201).send({
      success: true,
      message: "Booking confirmed!",
      bookingId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).send({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

// Cancel/Delete booking
app.delete("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).send({
        success: false,
        message: "Booking not found",
      });
    }

    // Delete booking
    await bookingsCollection.deleteOne({ _id: new ObjectId(id) });

    // Update car status back to available
    await carsCollection.updateOne(
      { _id: new ObjectId(booking.carId) },
      { $set: { status: "available" } }
    );

    res.send({
      success: true,
      message: "Booking cancelled successfully!",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).send({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
});

// ========================================
// 🚀 START SERVER
// ========================================
app.listen(port, () => {
  console.log(`🚀 GARIWALA Server running on port ${port}`);
});

// Export for Vercel
module.exports = app;