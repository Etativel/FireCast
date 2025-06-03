const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

// Get weather data
async function getWeatherData(req, res) {
  const { lon, lat } = req.body;

  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?key=${process.env.VISUAL_CROSSING_API}&unitGroup=metric&include=current,hours`
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch weather data" });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
}

async function getWeatherDataByCity(req, res) {
  const { city } = req.body;
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${process.env.VISUAL_CROSSING_API}&unitGroup=metric&include=current,hours`
    );

    if (!response.ok) {
      return res.status(response.status);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
}

// Get city data
async function getCityData(req, res) {
  const { lon, lat } = req.body;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPEN_WEATHER_API}`
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch city data" });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
}

module.exports = {
  getWeatherData,
  getCityData,
  getWeatherDataByCity,
};
