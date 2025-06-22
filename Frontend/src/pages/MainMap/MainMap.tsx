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
    if (map.current || !mapContainer.current) return;

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

  useEffect(() => {
    if (!map.current) return;

    map.current.setStyle(
      onScan ? maptilersdk.MapStyle.SATELLITE : maptilersdk.MapStyle.SATELLITE
    );
  }, [onScan]);

  // Initialize map by the click of a point

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
      touchAction: "none",
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

    // const onMouseDown = (e: MouseEvent) => {
    //   e.preventDefault();
    //   selecting = true;
    //   startX = e.clientX;
    //   startY = e.clientY;

    //   // Reset rectangle
    //   Object.assign(rectEl.style, {
    //     left: startX + "px",
    //     top: startY + "px",
    //     width: "0px",
    //     height: "0px",
    //     display: "block",
    //   });
    // };

    function onPointerDown(e: PointerEvent) {
      // only start on primary button or touch
      if (e.button !== 0 && e.pointerType === "mouse") return;
      selecting = true;
      startX = e.clientX;
      startY = e.clientY;

      overlay.setPointerCapture(e.pointerId);

      Object.assign(rectEl.style, {
        left: startX + "px",
        top: startY + "px",
        width: "0px",
        height: "0px",
        display: "block",
      });
    }

    // const onMouseMove = (e: MouseEvent) => {
    //   if (!selecting) return;

    //   const currentX = e.clientX;
    //   const currentY = e.clientY;

    //   const x = Math.min(currentX, startX);
    //   const y = Math.min(currentY, startY);
    //   const width = Math.abs(currentX - startX);
    //   const height = Math.abs(currentY - startY);

    //   Object.assign(rectEl.style, {
    //     left: x + "px",
    //     top: y + "px",
    //     width: width + "px",
    //     height: height + "px",
    //   });
    // };

    function onPointerMove(e: PointerEvent) {
      if (!selecting) return;
      const x = Math.min(e.clientX, startX);
      const y = Math.min(e.clientY, startY);
      const w = Math.abs(e.clientX - startX);
      const h = Math.abs(e.clientY - startY);
      Object.assign(rectEl.style, {
        left: x + "px",
        top: y + "px",
        width: w + "px",
        height: h + "px",
      });
    }

    async function onPointerUp(e: PointerEvent) {
      if (!selecting) return;
      selecting = false;

      overlay.releasePointerCapture(e.pointerId);

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
            const data = await captureSelectedRegion(currentMap, relativeRect);

            if (data) {
              navigate("/prediction", {
                state: {
                  heatmapImage: data.heatmap_base64,
                  satelliteImage: data.satellite_image_base64,
                  noWildFireProb: data.no_wildfire_prob,
                  yesWildFireProb: data.wildfire_prob,
                },
              });
              return;
            }
          } catch (error) {
            console.error("Failed to capture screenshot:", error);
          }
        }
      } else {
        cleanup();
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanup();
      }
    };

    // const onMouseUp = async (e: MouseEvent) => {
    //   if (!selecting) return;

    //   selecting = false;

    //   const currentX = e.clientX;
    //   const currentY = e.clientY;

    //   const x = Math.min(currentX, startX);
    //   const y = Math.min(currentY, startY);
    //   const width = Math.abs(currentX - startX);
    //   const height = Math.abs(currentY - startY);

    //   // Only capture if selection is large enough
    //   if (width > 10 && height > 10) {
    //     // Get map container bounds to calculate relative position
    //     const mapContainerElement = mapContainer.current;
    //     if (mapContainerElement) {
    //       const mapRect = mapContainerElement.getBoundingClientRect();

    //       // Calculate coordinates relative to the map container
    //       const relativeRect = {
    //         x: Math.max(0, x - mapRect.left),
    //         y: Math.max(0, y - mapRect.top),
    //         width: Math.min(
    //           width,
    //           mapRect.width - Math.max(0, x - mapRect.left)
    //         ),
    //         height: Math.min(
    //           height,
    //           mapRect.height - Math.max(0, y - mapRect.top)
    //         ),
    //       };

    //       console.log("Capturing selection:", relativeRect);

    //       // Cleanup overlay first
    //       cleanup();

    //       // Capture the selected region
    //       try {
    //         const data = await captureSelectedRegion(currentMap, relativeRect);

    //         if (data) {
    //           navigate("/prediction", {
    //             state: {
    //               heatmapImage: data.heatmap_base64,
    //               satelliteImage: data.satellite_image_base64,
    //               noWildFireProb: data.no_wildfire_prob,
    //               yesWildFireProb: data.wildfire_prob,
    //             },
    //           });
    //           return;
    //         }
    //       } catch (error) {
    //         console.error("Failed to capture screenshot:", error);
    //       }
    //     }
    //   } else {
    //     cleanup();
    //   }
    // };

    // Add event listeners
    // overlay.addEventListener("mousedown", onMouseDown);
    // overlay.addEventListener("mousemove", onMouseMove);
    // overlay.addEventListener("mouseup", onMouseUp);
    overlay.addEventListener("pointerdown", onPointerDown);
    overlay.addEventListener("pointermove", onPointerMove);
    overlay.addEventListener("pointerup", onPointerUp);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScan, setOnScan]);

  return (
    <div id="map-container" className="w-full h-full border-transparent">
      <div ref={mapContainer} className="  absolute w-[100%] h-[100%]" />
    </div>
  );
}

// use maptiler builtin screenshot
async function takeMapScreenshot(
  map: maptilersdk.Map,
  rect?: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    map.once("idle", () => {
      try {
        const canvas = map.getCanvas();
        const dpr = window.devicePixelRatio || 1;

        if (rect) {
          const cropped = document.createElement("canvas");
          const ctx = cropped.getContext("2d");
          if (!ctx) throw new Error("Could not get context");

          // Scale up the canvas so it has the same resolution as the map's backing store
          cropped.width = rect.width * dpr;
          cropped.height = rect.height * dpr;

          // Draw the correct pixel region
          ctx.drawImage(
            canvas,
            rect.x * dpr,
            rect.y * dpr,
            rect.width * dpr,
            rect.height * dpr,
            0,
            0,
            rect.width * dpr,
            rect.height * dpr
          );

          //  down‑sample back to CSS size for the dataURL
          const final = document.createElement("canvas");
          final.width = rect.width;
          final.height = rect.height;
          final
            .getContext("2d")!
            .drawImage(cropped, 0, 0, rect.width, rect.height);

          resolve(final.toDataURL("image/png"));
        } else {
          resolve(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        reject(err);
      }
    });
    map.triggerRepaint();
  });
}

async function handleCapturedImage(dataUrl: string) {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append("file", blob, "map-screenshot.png");

    const apiResponse = await fetch(
      `https://firecast-model.up.railway.app/predict_cam`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!apiResponse.ok) {
      console.error("API request failed:", apiResponse.statusText);

      return;
    }
    const data = await apiResponse.json();
    return data;
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
    const data = await handleCapturedImage(dataUrl);
    if (data) {
      return data;
    }
    return;
  } catch (error) {
    console.error("Error capturing region:", error);
  }
}
