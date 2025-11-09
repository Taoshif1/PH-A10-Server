
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
    origin: ['http://localhost:5173', 'YOUR_NETLIFY_CLIENT_URL'], // Add your final Netlify domain here
    credentials: true,
}));
app.use(express.json());


// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch(err => console.error("MongoDB connection error:", err));

// --- Basic Routes ---
app.get('/', (req, res) => {
    res.send('GariWala Server is Running!');
});

// --- TODO: API Routes (Car Routes, Booking Routes, Auth Routes) will go here ---

app.listen(port, () => {
    console.log(`Gariwala Server listening on port ${port}`);
});