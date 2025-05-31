import clearday from "../assets/icons/weather-icons/clear-day.png";

import clearnight from "../assets/icons/weather-icons/clear-night.png";
import cloudy from "../assets/icons/weather-icons/cloudy.png";
import fog from "../assets/icons/weather-icons/fog.png";
import wind from "../assets/icons/weather-icons/wind.png";
import rain from "../assets/icons/weather-icons/rain.png";
import snow from "../assets/icons/weather-icons/snow.png";
import snowshowersday from "../assets/icons/weather-icons/snow-showers-day.png";
import snowshowersnight from "../assets/icons/weather-icons/snow-showers-night.png";
import thunderrain from "../assets/icons/weather-icons/thunder-rain.png";
import thundershowersday from "../assets/icons/weather-icons/thunder-showers-day.png";
import thundershowersnight from "../assets/icons/weather-icons/thunder-showers-night.png";
import showersday from "../assets/icons/weather-icons/showers-day.png";
import showersnight from "../assets/icons/weather-icons/showers-night.png";
import partlycloudyday from "../assets/icons/weather-icons/partly-cloudy-day.png";
import partlycloudynight from "../assets/icons/weather-icons/partly-cloudy-night.png";

export type WeatherIconKey =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "fog"
  | "wind"
  | "rain"
  | "snow"
  | "snow-showers-day"
  | "snow-showers-night"
  | "thunder-rain"
  | "thunder-showers-day"
  | "thunder-showers-night"
  | "showers-day"
  | "showers-night"
  | "partly-cloudy-day"
  | "partly-cloudy-night";

const icons: Record<WeatherIconKey, string> = {
  "clear-day": clearday,
  "clear-night": clearnight,
  cloudy: cloudy,
  fog: fog,
  wind: wind,
  rain: rain,
  snow: snow,
  "snow-showers-day": snowshowersday,
  "snow-showers-night": snowshowersnight,
  "thunder-rain": thunderrain,
  "thunder-showers-day": thundershowersday,
  "thunder-showers-night": thundershowersnight,
  "showers-day": showersday,
  "showers-night": showersnight,
  "partly-cloudy-day": partlycloudyday,
  "partly-cloudy-night": partlycloudynight,
};

export default icons;
