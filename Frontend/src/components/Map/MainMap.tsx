import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";

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
  const zoom = 10;
  maptilersdk.config.apiKey = "VeFBYMzeYDGVkF6SbzJK";
  const [lngLat, setLngLat] = useState<lonLat>({
    lng: tokyo.lng,
    lat: tokyo.lat,
  });

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
  useEffect(() => {
    if (!map.current || !lngLat) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const marker = new maptilersdk.Marker({ color: "#FF0000" })
      .setLngLat([lngLat.lng, lngLat.lat])
      .addTo(map.current);
    markerRef.current = marker;
  }, [lngLat]);

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
    if (lngLat) {
      new maptilersdk.Marker({ color: "#FF0000" })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(map.current);
    }
  }, [tokyo.lng, tokyo.lat, zoom, lngLat]);

  useEffect(() => {
    if (!map.current) return;

    const handleClick = (event: ClickEvent) => {
      const { lat, lng } = event.lngLat;
      setLngLat({
        lat: lat,
        lng: lng,
      });
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
