const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

// Global variables to persist state
let fillStartTime = null;
let decreaseStartTime = null;
let isFilling = false;
let isDraining = false;
const tankCapacity = 1000;
let currentWaterLevel = 50; // Initial water level percentage

// Mongoose Model
const WaterLevel = mongoose.model("water_levels", new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    tankFillDuration: String, // Changed to String to store formatted duration
    tankDecreaseDuration: String, // Changed to String to store formatted duration
    usageRate: Number,
    rainfall: Number,
    temperature: Number,
    humidity: Number,
    Level: Number
}));

(async () => {
    try {
        const latestLevelDocument = await WaterLevel.findOne({}, { Level: 1, _id: 0 })
            .sort({ timestamp: -1 });
        if (latestLevelDocument) {
            currentWaterLevel = latestLevelDocument.Level;
            console.log("Initial water level fetched from database:", currentWaterLevel);
        } else {
            console.log("No water level data found in database, using default:", currentWaterLevel);
        }
    } catch (error) {
        console.error("Error fetching initial water level from database:", error);
    }
})();

async function getWeatherData() {
    try {
        const response = await axios.get("https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.76&current=temperature_2m,relative_humidity_2m,precipitation");
        const weather = response.data.current;
        return {
            temperature: weather.temperature_2m,
            humidity: weather.relative_humidity_2m,
            rainfall: weather.precipitation
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return { temperature: null, humidity: null, rainfall: null };
    }
}

async function saveWaterLevelData(waterLevelValue) {
    try {
        let tankFillDuration = "00:00:00";
        let tankDecreaseDuration = "00:00:00";
        let usageRate = 0;
        const weatherData = await getWeatherData();
        const now = new Date();

        function addZero(num) {
            return Math.floor(num) < 10 ? `0${Math.floor(num)}` : Math.floor(num);
        }

        function formatDuration(timeMs) {
            const totalSeconds = Math.floor(timeMs / 1000);
            const seconds = addZero(totalSeconds % 60);
            const minutes = addZero((totalSeconds / 60) % 60);
            const hours = addZero(totalSeconds / 3600);
            return `${hours}:${minutes}:${seconds}`;
        }

        // Filling state management and duration calculation
        if (waterLevelValue > 10 && !isFilling && !isDraining) {
            fillStartTime = new Date();
            console.log("Filling started at:", fillStartTime.toISOString());
            if(waterLevelValue >= 90) {
                isFilling = true;
            }
            isDraining = false;
            decreaseStartTime = null;
        } else if (waterLevelValue >= 90 && isFilling && fillStartTime) {
            let filled = new Date();
            console.log("Filling stopped at:", filled.toISOString());
            const fillDurationMs = filled.getTime() - fillStartTime.getTime();
            tankFillDuration = formatDuration(fillDurationMs);
            console.log("Fill duration:", tankFillDuration);
            isFilling = false;
            fillStartTime = null;
        }

        // Draining state management and duration/usage rate calculation
        if (waterLevelValue < 100 && !isDraining && !isFilling) {
            decreaseStartTime = new Date();
            console.log("Draining started at:", decreaseStartTime.toISOString());
            isDraining = true;
            console.log("Is draining:", isDraining);
            isFilling = false;
            fillStartTime = null;
        } else if (waterLevelValue < 20 && isDraining && decreaseStartTime) {
            let drained = new Date();
            console.log("Draining stopped at:", drained.toISOString());
            const drainDurationMs = drained.getTime() - decreaseStartTime.getTime();
            const drainDurationMinutes = drainDurationMs / 60000; // Convert to minutes
            tankDecreaseDuration = formatDuration(drainDurationMs);
            usageRate = drainDurationMinutes > 0 ? parseFloat((tankCapacity / drainDurationMinutes).toFixed(2)) : 0;
            console.log("Drain duration:", tankDecreaseDuration);
            console.log("Usage rate:", usageRate, "units/minute");
            isDraining = false;
            decreaseStartTime = null;
        }

        const newEntry = new WaterLevel({
            timestamp: now,
            tankFillDuration,
            tankDecreaseDuration,
            usageRate,
            rainfall: weatherData ? weatherData.rainfall : null,
            temperature: weatherData ? weatherData.temperature : null,
            humidity: weatherData ? weatherData.humidity : null,
            Level: waterLevelValue
        });
        
        await newEntry.save();
        console.log("Data saved:", newEntry);
        currentWaterLevel = waterLevelValue; // Update current water level
    } catch (error) {
        console.error("Error saving water level data:", error);
    }
}

// API endpoint to get the current water level
app.get('/api/water-level', (req, res) => {
    res.json({ level: currentWaterLevel });
});

// API endpoint to fill water
app.post('/api/fill-water', (req, res) => {
    const fillAmount = req.body.amount || 10; // Default fill amount
    currentWaterLevel = Math.min(100, currentWaterLevel + fillAmount);
    if (currentWaterLevel >= 90) {
        saveWaterLevelData(currentWaterLevel);
    }
    res.json({ message: `Filled water by ${fillAmount}%, current level: ${currentWaterLevel}%` });
});

// API endpoint to reduce water
app.post('/api/reduce-water', (req, res) => {
    const reduceAmount = req.body.amount || 10; // Default reduce amount
    currentWaterLevel = Math.max(0, currentWaterLevel - reduceAmount);
    if (currentWaterLevel < 20) {
        saveWaterLevelData(currentWaterLevel);
    }
    res.json({ message: `Reduced water by ${reduceAmount}%, current level: ${currentWaterLevel}%` });
});

// API endpoint to get the latest water level data history
app.get('/api/water-level-history', async (req, res) => {
    try {
        const latestLevels = await WaterLevel.find().sort({ timestamp: -1 }).limit(10);
        res.json(latestLevels);
    } catch (error) {
        console.error("Error fetching water level history:", error);
        res.status(500).json({ error: "Failed to fetch water level history" });
    }
});

app.get('/', (req, res) => res.send('Server is ready'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));