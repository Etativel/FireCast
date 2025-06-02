import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Wind, Droplets, Gauge, Eye } from "lucide-react";
import icons from "../../utility/attachIcon";
import type { Weather, PopupProps, weatherDataType } from "../../types/Map/Map";

const API_KEY_2 = "6ed1c13520bbdb255f5c2fb196794ea8";
const API_KEY = "YPC3DM45JTFTRKZF8EXVGKAZY";

export default function Popup({ lon, lat, navigate }: PopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [weatherData, setWeatherData] = useState<weatherDataType | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    async function fetchWeatherData(lon: number, lat: number) {
      if (!lon || !lat) return;

      try {
        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lon},${lat}?key=${API_KEY}&unitGroup=metric&include=current`
        );
        if (!response.ok) {
          console.log(response.statusText);
        }
        const data = await response.json();
        console.log("this is weather", data);
        setWeather(data);
      } catch (err) {
        console.log(err);
      }
    }

    async function fetchCityData(lon: number, lat: number) {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=${1}&appid=${API_KEY_2}`
      );
      if (!response.ok) {
        console.log("Failed to get name", response.statusText);
        setIsFetching(false);
      }
      const data = await response.json();
      if (data) {
        setWeatherData(data[0]);
        setIsFetching(false);
        return;
      }
      setWeatherData(null);
      setIsFetching(false);
    }
    fetchWeatherData(lat, lon);
    fetchCityData(lon, lat);
  }, [lon, lat]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!(weather && weatherData)) return;
    navigate("/weather-info", {
      state: { weatherInfo: weather, weatherCity: weatherData },
    });
    return;
  };

  return (
    <div
      onClick={(e) => onClick(e)}
      className={`lg:w-80 w-65  relative transform -translate-y-[55%] transition-all duration-200 ${
        isVisible ? "scale-100 " : "scale-0"
      }`}
    >
      {/* Popup container */}
      {weather ? (
        <div className="bg-neutral-800/60 backdrop-blur-md rounded-lg border border-transparent flex flex-col px-4 py-3">
          <div className=" flex justify-center">
            <img
              className="size-20"
              src={icons[weather.currentConditions.icon as keyof typeof icons]}
            />
          </div>

          {isFetching ? (
            <div className="h-7 w-32 rounded animate-pulse"></div>
          ) : (
            <p className="text-center text-xl font-semibold text-white">
              {weatherData?.name ?? "Unknown location"}
            </p>
          )}

          {/* Temperature and Condition */}

          <div className="text-center mt-3 mb-4">
            <div className="text-3xl font-bold text-white">
              {weather.currentConditions.temp}°C
            </div>
            <div className="text-sm text-gray-300 capitalize">
              {weather.currentConditions.conditions}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              Feels like {weather.currentConditions.feelslike}°C
            </div>
          </div>

          {/* Weather metrics grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2 text-white items-center">
              <div>
                <Droplets className="size-6" />
              </div>

              <div>
                <span className="block text-sm font-medium">
                  {weather?.currentConditions.humidity}%
                </span>
                <span className="block text-xs text-gray-300">Humidity</span>
              </div>
            </div>

            <div className="flex gap-2 text-white items-center justify-end">
              <div>
                <Wind className="size-6" />
              </div>
              <div>
                <span className="block text-sm font-medium">
                  {weather.currentConditions.windspeed} km/h
                </span>
                <span className="block text-xs text-gray-300">Wind Speed</span>
              </div>
            </div>

            <div className="flex gap-2 text-white items-center ">
              <div>
                <Eye className="size-6" />
              </div>
              <div>
                <span className="block text-sm font-medium">
                  {weather.currentConditions.visibility} km
                </span>
                <span className="block text-xs text-gray-300">Visibility</span>
              </div>
            </div>

            <div className="flex gap-2 text-white items-center justify-end">
              <div>
                <Gauge className="size-6" />
              </div>
              <div>
                <span className="block text-sm font-medium">
                  {weather.currentConditions.pressure} mb
                </span>
                <span className="block text-xs text-gray-300">Pressure</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 bg-neutral-800/60 backdrop-blur-md rounded-lg border border-transparent flex flex-col px-4 py-3"></div>
      )}

      {/* Pointer/Arrow pointing down */}
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 top-full transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-neutral-800/60"></div>
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-neutral-800/60 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-px"></div>
      </div>
    </div>
  );
}
