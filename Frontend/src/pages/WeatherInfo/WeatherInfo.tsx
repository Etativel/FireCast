import "./WeatherInfo.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import marker from "../../assets/maps-and-flags.png";
import { useLocation } from "react-router-dom";
import { icons, lineChart, API_URL } from "../../utility";
import type { WeatherIconKey } from "../../utility/attachIcon";
import type {
  CurrWeather,
  CityInfoShort,
  LngLat,
} from "../../types/WeatherInfo/WeatherInfo";

type ChartDataPoint = { x: string; y: number };

export default function WeatherInfo() {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markerLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const { state } = useLocation();
  const { weatherData, weatherCity } = state;
  const [currWeather, setCurrWeather] = useState<CurrWeather>(weatherData);
  const [isFetching, setIsFetching] = useState(false);
  const [markerCoords, setMarkerCoords] = useState<[number, number] | null>(
    fromLonLat([weatherCity.lon, weatherCity.lat]) as [number, number]
  );
  const [cityInfo, setCityInfo] = useState<CityInfoShort | null>(null);
  const [fetchParams, setFetchParams] = useState<LngLat>({
    lon: weatherCity.lon,
    lat: weatherCity.lat,
  });
  // For the horizontal scroller:
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScroll, setInitialScroll] = useState(0);
  const [uvData, setUvData] = useState<ChartDataPoint[] | null>(null);
  const [tempData, setTempData] = useState<ChartDataPoint[] | null>(null);
  const [humidData, setHumidData] = useState<ChartDataPoint[] | null>(null);
  const [activeChart, setActiveChart] = useState("temp");

  // Search bar
  const [searchQuery, setSearchQuery] = useState("");
  const [prevQuery, setPrevQuery] = useState(searchQuery);

  console.log(cityInfo);

  function addMarker(coordinates: [number, number]) {
    if (!markerLayer.current) return;

    markerLayer.current.getSource()?.clear();

    const iconFeature = new Feature({
      geometry: new Point(coordinates),
    });
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: marker,
        scale: 0.05,
      }),
    });
    iconFeature.setStyle(iconStyle);
    markerLayer.current.getSource()?.addFeature(iconFeature);
  }

  async function fetchWeatherData(lon: number, lat: number) {
    try {
      const res = await fetch(`${API_URL}/weather/weather-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lon,
          lat,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrWeather(data);
      } else {
        console.warn("Weather API failed:", res.statusText);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCityData(lon: number, lat: number) {
    try {
      const res = await fetch(`${API_URL}/weather/city-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lon,
          lat,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setCityInfo({
            country: data[0].country,
            lat: data[0].lat,
            lon: data[0].lon,
            name: data[0].name,
          });
        }
      } else {
        console.warn("Reverse geocode failed:", res.statusText);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchByCity(cityName: string) {
    try {
      const res = await fetch(`${API_URL}/weather/by-city`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: cityName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const parts = data.resolvedAddress.split(",");
        const country = parts[parts.length - 1].trim();
        const webMercatorCoords = fromLonLat([
          data.longitude,
          data.latitude,
        ]) as [number, number];

        setCurrWeather(data);
        setCityInfo({
          country: country,
          lat: data.latitude,
          lon: data.longitude,
          name: data.address.charAt(0).toUpperCase() + data.address.slice(1),
        });
        setMarkerCoords(webMercatorCoords);
      } else {
        console.warn("Weather API failed:", res.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const { lon, lat } = fetchParams;

    async function fetchAllData(lon: number, lat: number) {
      try {
        await Promise.all([
          fetchWeatherData(lon, lat),
          fetchCityData(lon, lat),
        ]);
      } catch (err) {
        console.error("Fetch error", err);
      }
    }
    setIsFetching(true);
    fetchAllData(lon, lat).finally(() => setIsFetching(false));
  }, [fetchParams]);

  useEffect(() => {
    let chartData = null;
    switch (activeChart) {
      case "temp":
        chartData = tempData;
        break;
      case "uv":
        chartData = uvData;
        break;
      case "humid":
        chartData = humidData;
        break;
    }
    if (chartData && chartData?.length > 0) {
      lineChart(chartData);
    }
  }, [activeChart, tempData, uvData, humidData]);

  useEffect(() => {
    if (!currWeather) return;

    const webTitleContainer = document.querySelector(".web-title");

    if (!webTitleContainer || !currWeather?.currentConditions) return;

    webTitleContainer.textContent = currWeather.currentConditions.conditions;

    if (!currWeather) return;

    const hours = currWeather.days[0].hours;

    if (!hours) return;

    const tempData = hours.map((hour) => ({
      x: hour.datetime,
      y: hour.temp,
    }));
    setTempData(tempData);

    const uvData = hours.map((hour) => ({
      x: hour.datetime,
      y: hour.uvindex,
    }));
    setUvData(uvData);

    const humidData = hours.map((hour) => ({
      x: hour.datetime,
      y: hour.humidity,
    }));
    setHumidData(humidData);
  }, [currWeather, cityInfo]);

  useEffect(() => {
    if (!mapRef.current) return;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: `https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=MeDWRjir5sGmDMPsPW8P`,
        crossOrigin: "anonymous",
      }),
    });

    const vectorSource = new VectorSource();
    markerLayer.current = new VectorLayer({ source: vectorSource });

    map.current = new Map({
      target: mapRef.current,
      layers: [baseLayer, markerLayer.current],
      view: new View({
        center: markerCoords || fromLonLat([0, 0]),
        zoom: 8,
      }),
      controls: [],
    });

    map.current.on("click", (event) => {
      const projected = event.coordinate as [number, number];
      const [lon, lat] = toLonLat(projected);

      setMarkerCoords(projected);

      setFetchParams({ lon, lat });
    });

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (markerCoords && map.current && markerLayer.current) {
      addMarker(markerCoords);
      map.current.getView().setCenter(markerCoords);
    }
  }, [markerCoords]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!scrollerRef.current) return;

      e.preventDefault();

      const rect = scrollerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // Adjust sensitivity
      const walk = (x - startX) * 1.5;
      scrollerRef.current.scrollLeft = initialScroll - walk;
    },
    [startX, initialScroll]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // useCallback and proper cleanup
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollerRef.current) return;

    //  start drag on left mouse button
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);

    const rect = scrollerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setStartX(x);
    setInitialScroll(scrollerRef.current.scrollLeft);
  };

  // add wheel scroll support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollerRef.current) return;

    // scroll horizontally
    scrollerRef.current.scrollLeft += e.deltaY;
  };

  async function submitQuery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!searchQuery.trim() || prevQuery === searchQuery) return;
    setPrevQuery(searchQuery);

    setIsFetching(true);
    await fetchByCity(searchQuery);
    setIsFetching(false);
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 flex flex-col lg:px-20 ">
      {/* Search bar */}
      <div className="flex items-center px-4 py-3 h-16 lg:px-20">
        <form onSubmit={(e) => submitQuery(e)}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city..."
            className="flex-grow px-4 py-2 rounded-lg bg-neutral-800/50 backdrop-blur-sm border border-neutral-600/30 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500/50 max-w-sm transition-all duration-300"
          />
        </form>
      </div>

      {/* Main content */}
      <div className="flex flex-wrap lg:flex-nowrap overflow-auto flex-1 px-4 lg:px-20 gap-6 pb-6 hide-scrollbar mb-5">
        <div className="flex flex-col flex-grow lg:flex-grow-0 lg:w-full gap-6 min-w-[280px]">
          {isFetching || !currWeather?.currentConditions || !cityInfo ? (
            // Skeleton with matching structure and height
            <div className="bg-gradient-to-br from-neutral-700/60 to-neutral-600/40 backdrop-blur-md border border-neutral-500/20 rounded-xl p-4 sm:p-6 shadow-2xl hover:shadow-neutral-600/30 transition-all duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6">
                {/* Weather icon skeleton */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-600/40 rounded-lg animate-pulse flex-shrink-0"></div>

                {/* City name skeleton */}
                <div className="flex flex-col min-w-0 gap-2">
                  <div className="h-8 sm:h-10 lg:h-12 w-32 sm:w-40 bg-neutral-600/40 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-neutral-600/40 rounded animate-pulse"></div>
                </div>

                {/* Temperature skeleton */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right gap-1">
                  <div className="h-6 sm:h-8 w-12 bg-neutral-600/40 rounded animate-pulse"></div>
                  <div className="h-3 sm:h-4 w-20 bg-neutral-600/40 rounded animate-pulse"></div>
                </div>

                {/* Humidity skeleton */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right gap-1">
                  <div className="h-6 sm:h-8 w-12 bg-neutral-600/40 rounded animate-pulse"></div>
                  <div className="h-3 sm:h-4 w-16 bg-neutral-600/40 rounded animate-pulse"></div>
                </div>

                {/* Wind speed skeleton */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right gap-1">
                  <div className="h-6 sm:h-8 w-8 bg-neutral-600/40 rounded animate-pulse"></div>
                  <div className="h-3 sm:h-4 w-20 bg-neutral-600/40 rounded animate-pulse"></div>
                </div>
              </div>

              <div>
                <div className="h-4 w-32 bg-neutral-600/40 rounded animate-pulse mb-3"></div>
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center min-w-[60px] bg-neutral-800/30 rounded-lg p-3 border border-neutral-600/20"
                    >
                      <div className="h-3 w-8 bg-neutral-600/40 rounded animate-pulse mb-2"></div>
                      <div className="w-8 h-8 bg-neutral-600/40 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-6 bg-neutral-600/40 rounded animate-pulse mb-1"></div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-neutral-600/40 animate-pulse"></div>
                        <div className="h-3 w-6 bg-neutral-600/40 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-neutral-700/60 to-neutral-600/40 backdrop-blur-md border border-neutral-500/20 rounded-xl p-4 sm:p-6 shadow-2xl hover:shadow-neutral-600/30 transition-all duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <img
                  src={
                    icons[currWeather.currentConditions.icon as WeatherIconKey]
                  }
                  alt="Weather icon"
                  className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0"
                />

                <div className="flex flex-col min-w-0">
                  <span className=" h-fit text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                    {cityInfo?.name || "Unknown Location"}
                  </span>
                  <span className="text-sm font-semibold text-neutral-200">
                    {cityInfo?.country || "Unknown"}
                  </span>
                </div>

                <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                  <span className="text-xl sm:text-2xl font-semibold text-white">
                    {Math.round(currWeather.currentConditions.temp)}°
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-200">
                    Temperature
                  </span>
                </div>

                <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                  <span className="text-2xl sm:text-2xl font-semibold text-white">
                    {Math.round(currWeather.currentConditions.humidity)}{" "}
                    <sub className="text-xs sm:text-sm text-neutral-200 ">
                      %
                    </sub>
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-200">
                    Humidity
                  </span>
                </div>

                <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                  <span className="text-xl sm:text-2xl font-semibold text-white flex items-baseline">
                    {Math.round(currWeather.currentConditions.windspeed)}
                    <sub className="text-xs sm:text-sm text-neutral-200 ml-1">
                      km/h
                    </sub>
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-200">
                    Wind Speed
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-200 mb-3">
                  Today's Forecast
                </h3>
                <div
                  ref={scrollerRef}
                  className={`flex gap-4 overflow-x-auto scrollbar-hide pb-2 select-none ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  onMouseDown={handleMouseDown}
                  onWheel={handleWheel}
                  //   onSelectStart={(e) => e.preventDefault()}
                >
                  {currWeather.days[0].hours?.map((hour, index) => {
                    const hourNum = parseInt(hour.datetime.split(":")[0], 10);
                    const displayTime =
                      hourNum > 12
                        ? `${hourNum - 12} PM`
                        : hourNum === 12
                        ? "12 PM"
                        : hourNum === 0
                        ? "12 AM"
                        : `${hourNum} AM`;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center min-w-[80px] bg-neutral-800/30 rounded-lg p-3 border border-neutral-600/20 hover:bg-neutral-700/40 transition-colors select-none"
                      >
                        <span className="text-xs text-neutral-300 font-medium mb-1">
                          {displayTime}
                        </span>
                        <img
                          src={icons[hour.icon as WeatherIconKey]}
                          alt={hour.conditions}
                          className="w-8 h-8 mb-2"
                          draggable={false}
                        />
                        <span className="text-sm font-semibold text-white mb-1">
                          {Math.round(hour.temp)}°
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400/60"></div>
                          <span className="text-xs text-blue-300">
                            {Math.round(hour.precipprob || 0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <div className="bg-gradient-to-br from-neutral-600/60 to-neutral-700/40 backdrop-blur-md   rounded-xl shadow-2xl hover:shadow-neutral-500/30 transition-all duration-300 h-[400px] flex flex-col">
            <div className="flex justify-between px-5 pt-2 mb-2 flex-wrap">
              <div className="text-2xl font-semibold text-white ">Overview</div>
              <div className="flex gap-4 bg-neutral-700 shadow rounded-full  text-white font-semibold ">
                <button
                  className={`${
                    activeChart === "temp"
                      ? "bg-neutral-400 rounded-full px-4"
                      : "px-4 cursor-pointer"
                  }`}
                  onClick={() => setActiveChart("temp")}
                >
                  Temp
                </button>
                <button
                  className={`${
                    activeChart === "uv"
                      ? "bg-neutral-400 rounded-full px-4"
                      : "px-4 cursor-pointer"
                  }`}
                  onClick={() => setActiveChart("uv")}
                >
                  UV
                </button>
                <button
                  className={`${
                    activeChart === "humid"
                      ? "bg-neutral-400 rounded-full px-4"
                      : "px-4 cursor-pointer"
                  }`}
                  onClick={() => setActiveChart("humid")}
                >
                  Humidity
                </button>
              </div>
            </div>
            <div className=" h-[100%] rounded-2xl" id="chart-container"></div>
          </div>
        </div>

        {/* Map + Info */}
        <div className="flex flex-col flex-grow lg:flex-grow-0 lg:w-1/2 gap-6 min-w-[280px]">
          <div
            ref={mapRef}
            className="
               
              rounded-xl shadow-2xl  
              transition-all duration-300 overflow-hidden h-[320px] w-full
            "
          ></div>

          <div className="bg-gradient-to-br from-neutral-600/60 to-neutral-700/40 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-neutral-500/30 transition-all duration-300 h-[300px]">
            <div className="flex flex-col h-full">
              <div className="flex justify-between px-4 py-2 flex-wrap mb-2">
                <span className="text-2xl font-semibold text-white">
                  Forecast
                </span>
              </div>

              {currWeather ? (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-2 hide-scrollbar">
                  {currWeather.days.map((day, index) => {
                    const formatDate = (isoDate: string) => {
                      const date = new Date(isoDate);
                      const dayNum = date.getDate();
                      const month = date.toLocaleString("en-US", {
                        month: "short",
                      });
                      const weekday = date.toLocaleString("en-US", {
                        weekday: "short",
                      });
                      return `${dayNum} ${month}, ${weekday}`;
                    };
                    return (
                      <div
                        key={index}
                        className="py-2.5 flex justify-between px-4 bg-neutral-800/60 mx-4 rounded-xl"
                      >
                        <div className="flex items-center">
                          <img
                            className="size-8"
                            src={icons[day.icon as WeatherIconKey]}
                            alt=""
                          />
                          <span className="pr-2 pl-2 text-md font-semibold text-white">
                            {day.temp}°
                          </span>
                          <span className="text-md text-white font-semibold">
                            {day.conditions.split(",")[0] === "Partially cloudy"
                              ? "Cloudy"
                              : day.conditions.split(",")[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-white">
                          <span>{formatDate(day.datetime)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
