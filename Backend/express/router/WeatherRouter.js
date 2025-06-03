const express = require("express");
const router = express.Router();
const controller = require("../controller/WeatherController");

router.post("/weather-data", controller.getWeatherData);
router.post("/by-city", controller.getWeatherDataByCity);
router.post("/city-data", controller.getCityData);

module.exports = router;
