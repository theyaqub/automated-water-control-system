const mongoose = require('mongoose');

const waterDataSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    fillStartTime: Date,
    fillEndTime: Date,
    tankFillDuration: Number, // Minutes
    decreaseStartTime: Date,
    decreaseEndTime: Date,
    tankDecreaseDuration: Number, // Minutes
    usageRate: Number, // Liters/min
    rainfall: Number, // mm
    temperature: Number, // °C
    humidity: Number, // %
    groundwaterLevel: Number // m
});

module.exports = mongoose.model('waterData', waterDataSchema);