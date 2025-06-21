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
  onScan: boolean;
  setOnScan: React.Dispatch<React.SetStateAction<boolean>>;
}

// use maptiler builtin screenshot
async function takeMapScreenshot(
  map: maptilersdk.Map,
  rect?: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    // wait for map to be idle before taking screenshot
    map.once("idle", () => {
      try {
        const canvas = map.getCanvas();

        if (rect) {
          const croppedCanvas = document.createElement("canvas");
          const ctx = croppedCanvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          croppedCanvas.width = rect.width;
          croppedCanvas.height = rect.height;

          ctx.drawImage(
            canvas,
            rect.x,
            rect.y,
            rect.width,
            rect.height,
            0,
            0,
            rect.width,
            rect.height
          );

          resolve(croppedCanvas.toDataURL("image/png"));
        } else {
          // return full map screenshot
          resolve(canvas.toDataURL("image/png"));
        }
      } catch (error) {
        reject(error);
      }
    });
    map.triggerRepaint();
  });
}

async function handleCapturedImage(dataUrl: string) {
  try {
    const win = window.open();
    if (win) {
      win.document.write(`
        <html>
          <head><title>Map Screenshot</title></head>
          <body style="margin:0;padding:20px;background:#f0f0f0;">
            <img src="${dataUrl}" style="max-width:100%;height:auto;border:1px solid #ccc;"/>
            <div style="margin-top:10px;">
              <a href="${dataUrl}" download="map-screenshot.png" style="padding:10px 20px;background:#007cba;color:white;text-decoration:none;border-radius:4px;">Download Image</a>
            </div>
          </body>
        </html>
      `);
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append("file", blob, "map-screenshot.png");

    const apiResponse = await fetch(`${API_URL}/icon-retrieve/ga`, {
      method: "POST",
      body: formData,
    });

    if (apiResponse.ok) {
      const { answer } = await apiResponse.json();
      console.log("API Response:", answer);
      return answer;
    } else {
      console.error("API request failed:", apiResponse.statusText);
    }
  } catch (error) {
    console.error("Error handling captured image:", error);
  }
}

// capture selected region
async function captureSelectedRegion(
  map: maptilersdk.Map,
  rect: { x: number; y: number; width: number; height: number }
) {
  try {
    console.log("Capturing region:", rect);
    const dataUrl = await takeMapScreenshot(map, rect);
    await handleCapturedImage(dataUrl);
  } catch (error) {
    console.error("Error capturing region:", error);
  }
}

export default function MainMap({
  satellite,
  searchQuery,
  searchTrigger,
  onScan,
  setOnScan,
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

  const overlayRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!onScan || !map.current) return;

    const overlay = document.createElement("div");
    const rectEl = document.createElement("div");

    // Style the overlay
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      cursor: "crosshair",
      zIndex: "9999",
      backgroundColor: "rgba(0,0,0,0.3)",
    });

    // Style the selection rectangle
    Object.assign(rectEl.style, {
      position: "absolute",
      border: "2px dashed #00ff00",
      backgroundColor: "rgba(255,255,255,0.1)",
      pointerEvents: "none",
    });

    overlay.appendChild(rectEl);
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    let startX = 0,
      startY = 0;
    let selecting = false;
    const currentMap = map.current;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      selecting = true;
      startX = e.clientX;
      startY = e.clientY;

      // Reset rectangle
      Object.assign(rectEl.style, {
        left: startX + "px",
        top: startY + "px",
        width: "0px",
        height: "0px",
        display: "block",
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!selecting) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const x = Math.min(currentX, startX);
      const y = Math.min(currentY, startY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      Object.assign(rectEl.style, {
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
      });
    };

    const onMouseUp = async (e: MouseEvent) => {
      if (!selecting) return;

      selecting = false;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const x = Math.min(currentX, startX);
      const y = Math.min(currentY, startY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      // Only capture if selection is large enough
      if (width > 10 && height > 10) {
        // Get map container bounds to calculate relative position
        const mapContainerElement = mapContainer.current;
        if (mapContainerElement) {
          const mapRect = mapContainerElement.getBoundingClientRect();

          // Calculate coordinates relative to the map container
          const relativeRect = {
            x: Math.max(0, x - mapRect.left),
            y: Math.max(0, y - mapRect.top),
            width: Math.min(
              width,
              mapRect.width - Math.max(0, x - mapRect.left)
            ),
            height: Math.min(
              height,
              mapRect.height - Math.max(0, y - mapRect.top)
            ),
          };

          console.log("Capturing selection:", relativeRect);

          // Cleanup overlay first
          cleanup();

          // Capture the selected region
          try {
            await captureSelectedRegion(currentMap, relativeRect);
          } catch (error) {
            console.error("Failed to capture screenshot:", error);
          }
        }
      } else {
        cleanup();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanup();
      }
    };

    // Add event listeners
    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);

    function cleanup() {
      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
      document.removeEventListener("keydown", onKeyDown);
      setOnScan(false);
    }

    // Cleanup function
    return cleanup;
  }, [onScan, setOnScan]);

  return (
    <div id="map-container" className="w-full h-full border-transparent">
      <div ref={mapContainer} className="  absolute w-[100%] h-[100%]" />
    </div>
  );
}
