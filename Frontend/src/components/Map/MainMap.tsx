import { useRef, useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";

export default function MainMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const tokyo = { lng: 139.753, lat: 35.6844 };
  const zoom = 10;
  maptilersdk.config.apiKey = "VeFBYMzeYDGVkF6SbzJK";

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [tokyo.lng, tokyo.lat],
      zoom: zoom,
    });
    new maptilersdk.Marker({ color: "#FF0000" })
      .setLngLat([139.7525, 35.6846])
      .addTo(map.current);
  }, [tokyo.lng, tokyo.lat, zoom]);

  return (
    <div className="relative w-screen h-screen">
      <div ref={mapContainer} className="absolute w-[100%] h-[100%]" />
    </div>
  );
}
