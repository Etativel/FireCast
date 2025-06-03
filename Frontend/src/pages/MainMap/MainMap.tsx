import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { createRoot } from "react-dom/client";
import Popup from "../../components/Map/Popup";
import { useNavigate } from "react-router-dom";
import "./map.css";
import { API_URL } from "../../utility";

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

interface MainMapProps {
  satellite: boolean;
  searchQuery: string;
  searchTrigger: number;
}

export default function MainMap({
  satellite,
  searchQuery,
  searchTrigger,
}: MainMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const tokyo = { lng: 139.753, lat: 35.6844 };
  const markerRef = useRef<maptilersdk.Marker | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!map.current) return;

    map.current.setStyle(
      satellite ? maptilersdk.MapStyle.SATELLITE : maptilersdk.MapStyle.STREETS
    );
  }, [satellite]);

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
      <Popup lon={lngLat.lng} lat={lngLat.lat} navigate={navigate} />
    );
    // placeHolderEl.classList.add("w-10", "h-10", "bg-red-500");
    if (lngLat) {
      new maptilersdk.Marker({ element: placeHolderEl })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(map.current);
    }
  }, [tokyo.lng, tokyo.lat, lngLat, navigate]);

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
      popupRoot.render(<Popup lon={lng} lat={lat} navigate={navigate} />);

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
  }, [navigate]);

  useEffect(() => {
    if (!map.current) return;
    const mapInstance = map.current;

    (async function fetchWeather() {
      try {
        const res = await fetch(`${API_URL}/weather/by-city`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            city: searchQuery,
          }),
        });
        if (!res.ok) {
          console.log("Failed to retrieve city data, ", res.statusText);
          return;
        }
        const data = await res.json();
        const newLat = data.latitude;
        const newLon = data.longitude;
        setLngLat({
          lat: newLat,
          lng: newLon,
        });

        // Re center popup
        const target = mapInstance.project([newLon, newLat]);
        target.y -= 100;
        const offsetCenter = mapInstance.unproject(target);
        mapInstance.setCenter(offsetCenter);

        if (popupRootRef.current && popupRef.current) {
          popupRootRef.current.unmount();
          popupRef.current.remove();
        }

        // Create new popup element
        const popupEl = document.createElement("div");
        const popupRoot = createRoot(popupEl);
        popupRoot.render(
          <Popup lon={newLon} lat={newLat} navigate={navigate} />
        );

        popupRef.current = popupEl;
        popupRootRef.current = popupRoot;

        new maptilersdk.Marker({ element: popupEl })
          .setLngLat([newLon, newLat])
          .addTo(mapInstance);
        console.log("This si data from search", data);
      } catch (err) {
        console.log(err);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTrigger]);

  return (
    <div className="w-full h-full border-transparent">
      <div ref={mapContainer} className="  absolute w-[100%] h-[100%]" />
    </div>
  );
}
