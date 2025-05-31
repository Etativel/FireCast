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

function Popup() {
  const [isVisible, setIsVisible] = useState(false);

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
      className="relative transform -translate-y-[55%] p-20"
    >
      {/* Popup container */}
      <div
        className={`
    relative w-80 p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100
    rounded-2xl shadow-2xl transform transition-all duration-500
    ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
    border border-blue-100/50 backdrop-blur-sm
  `}
      >
        {/* Header with location and close button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📍 Tokyo, Japan
            </h2>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Current weather display */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-white/60 rounded-xl border border-white/40">
          <div className="text-5xl animate-bounce">☀️</div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
              Currently
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">26°C</div>
            <div className="text-gray-700 font-medium">Sunny & Clear</div>
            <div className="text-xs text-gray-500 mt-1">Feels like 28°C</div>
          </div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/40 p-3 rounded-lg text-center border border-white/30">
            <div className="text-sm text-gray-600 mb-1">Humidity</div>
            <div className="font-bold text-gray-800">65%</div>
          </div>
          <div className="bg-white/40 p-3 rounded-lg text-center border border-white/30">
            <div className="text-sm text-gray-600 mb-1">Wind</div>
            <div className="font-bold text-gray-800">12 km/h</div>
          </div>
        </div>

        {/* 3-day forecast */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
            📅 3-Day Forecast
          </h3>
          <div className="space-y-2">
            {[
              {
                day: "Saturday",
                icon: "🌤",
                temp: "24°",
                desc: "Partly Cloudy",
              },
              { day: "Sunday", icon: "🌧", temp: "22°", desc: "Light Rain" },
              { day: "Monday", icon: "⛅", temp: "23°", desc: "Overcast" },
            ].map((item, index) => (
              <div
                key={item.day}
                className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/30 hover:bg-white/70 transition-all duration-200 hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-medium text-gray-800">{item.day}</div>
                    <div className="text-xs text-gray-600">{item.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">
                    {item.temp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pointer/Arrow pointing down */}
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 top-full transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-blue-100"></div>
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-white absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-px"></div>
      </div>
    </div>
  );
}
export default function MainMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const tokyo = { lng: 139.753, lat: 35.6844 };
  const markerRef = useRef<maptilersdk.Marker | null>(null);
  const zoom = 10;
  const popupRef = useRef<HTMLDivElement | null>(null);
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
      center: [tokyo.lng, tokyo.lat],
      zoom: zoom,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      center: [tokyo.lng, tokyo.lat],
      zoom: zoom,
    });

    const placeHolderEl = document.createElement("div");
    createRoot(placeHolderEl).render(<Popup />);
    // placeHolderEl.classList.add("w-10", "h-10", "bg-red-500");
    if (lngLat) {
      new maptilersdk.Marker({ element: placeHolderEl })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(map.current);
    }
  }, [tokyo.lng, tokyo.lat, zoom, lngLat]);

  // Set the lat lng on click
  useEffect(() => {
    if (!map.current) return;

    const handleClick = (event: ClickEvent) => {
      const { lat, lng } = event.lngLat;
      if (popupRef.current) {
        popupRef.current.remove();
      }
      setLngLat({
        lat: lat,
        lng: lng,
      });

      const popupEl = document.createElement("div");
      createRoot(popupEl).render(<Popup />);
      popupRef.current = popupEl;
      console.log(lat, lng);

      // const location = toLonLat(coordinates);
      // const roundedLocation = [
      //   parseFloat(location[0].toFixed(2)),
      //   parseFloat(location[1].toFixed(2)),
      // ];
      // fetchData(roundedLocation);
      // addMarker(coordinates);
      // Cleanup listener on unmount
    };

    map.current.on("click", handleClick);

    return () => {
      map.current?.off("click", handleClick);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <div ref={mapContainer} className="absolute w-[100%] h-[100%]" />
    </div>
  );
}
