import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import { createRoot } from "react-dom/client";
import type { MouseEvent } from "react";

type ClickEvent = {
  lngLat: {
    lng: number;
    lat: number;
  };
};

type lonLat = {
  lng: number;
  lat: number;
};

interface weatherDataType {
  name: string;
  country: string;
  lat: number;
  lon: number;
}
const API_KEY_2 = "6ed1c13520bbdb255f5c2fb196794ea8";
const API_KEY = "YPC3DM45JTFTRKZF8EXVGKAZY";

function Popup({ lon, lat }: { lon: number; lat: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [weatherData, setWeatherData] = useState<weatherDataType | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchWeatherData(lon: number, lat: number) {
      if (!lon || !lat) return;
      console.log("this lon", lon);
      console.log("this lat", lat);
      try {
        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lon},${lat}?key=${API_KEY}&unitGroup=metric&include=current`
        );
        if (!response.ok) {
          console.log(response.statusText);
        }
        const data = await response.json();
        console.log("this is weather", data);
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
    console.log(typeof e);
    e.stopPropagation();

    alert("hello");
  };

  return (
    <div
      onClick={(e) => onClick(e)}
      className={`w-70 relative transform -translate-y-[55%] transition-all duration-200 ${
        isVisible ? "scale-100 " : "scale-0"
      }`}
    >
      {/* Popup container */}
      <div className=" bg-white/20 backdrop-blur-md rounded-lg border border-transparent">
        {isFetching ? (
          <div className="h-7 w-32  rounded animate-pulse mb-2"></div>
        ) : (
          <h2 className="text-xl font-semibold text-white mb-2">
            {weatherData?.name ?? "Unknown location"}
          </h2>
        )}

        <p className=" text-sm text-white/90 p-10">
          This uses Tailwind’s built-in opacity and backdrop-blur utilities to
          create a frosted glass effect.
        </p>
      </div>

      {/* Pointer/Arrow pointing down */}
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 top-full transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-white/20"></div>
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-px"></div>
      </div>
    </div>
  );
}
export default function MainMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const tokyo = { lng: 139.753, lat: 35.6844 };
  const markerRef = useRef<maptilersdk.Marker | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  maptilersdk.config.apiKey = "VeFBYMzeYDGVkF6SbzJK";
  const [lngLat, setLngLat] = useState<lonLat>({
    lng: tokyo.lng,
    lat: tokyo.lat,
  });

  // Initializing map
  useEffect(() => {
    if (!map.current || !mapContainer.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.SATELLITE,
      center: [114.19888124059656, -3.665522983335549],
      zoom: 4,
      navigationControl: false,
    });
  }, []);

  // Initialize Marker
  useEffect(() => {
    if (!map.current || !lngLat) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    if (popupRef.current) {
      const marker = new maptilersdk.Marker({ element: popupRef.current })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(map.current);
      markerRef.current = marker;
    }
  }, [lngLat]);

  // Initialize map by the click of a point
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    console.log(maptilersdk.MapStyle);

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.SATELLITE,
      center: [103.11509301423916, 41.089223120782464],
      zoom: 10,
      navigationControl: false,
    });

    const placeHolderEl = document.createElement("div");
    createRoot(placeHolderEl).render(
      <Popup lon={lngLat.lng} lat={lngLat.lat} />
    );
    // placeHolderEl.classList.add("w-10", "h-10", "bg-red-500");
    if (lngLat) {
      new maptilersdk.Marker({ element: placeHolderEl })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(map.current);
    }
  }, [tokyo.lng, tokyo.lat, lngLat]);

  // Set the lat lng on click
  useEffect(() => {
    if (!map.current) return;

    const handleClick = (event: ClickEvent) => {
      const { lat, lng } = event.lngLat;
      setLngLat({
        lat: lat,
        lng: lng,
      });

      if (popupRootRef.current && popupRef.current) {
        popupRootRef.current.unmount();
        popupRef.current.remove();
      }

      const popupEl = document.createElement("div");
      const popupRoot = createRoot(popupEl);
      popupRoot.render(<Popup lon={lng} lat={lat} />);

      popupRef.current = popupEl;
      popupRootRef.current = popupRoot;

      new maptilersdk.Marker({ element: popupEl })
        .setLngLat([lng, lat])
        .addTo(map.current!);
    };

    map.current.on("click", handleClick);

    return () => {
      map.current?.off("click", handleClick);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <div ref={mapContainer} className="  absolute w-[100%] h-[100%]" />
    </div>
  );
}
