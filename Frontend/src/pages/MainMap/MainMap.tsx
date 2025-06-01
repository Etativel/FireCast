import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { createRoot } from "react-dom/client";
import Popup from "../../components/Map/Popup";
import "./map.css";
import { useNavigate } from "react-router-dom";

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

export default function MainMap() {
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

  return (
    <div className="w-full h-full border-transparent">
      <div ref={mapContainer} className="  absolute w-[100%] h-[100%]" />
    </div>
  );
}
