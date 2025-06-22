import { Scan, Satellite, Map, LoaderCircle } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  satellite: boolean;
  isModelReady: boolean;
  isPredicting: boolean;
  setSatellite: React.Dispatch<React.SetStateAction<boolean>>;
  setOnScan: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MobileSidebar({
  setSatellite,
  satellite,
  setOnScan,
  isModelReady,
  isPredicting,
}: SidebarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="mt-13 z-100 -2 gap absolute flex flex-col md:hidden right-0 mr-2">
      {!isModelReady || isPredicting ? (
        <div
          className="relative p-2 bg-neutral-800 rounded-lg mt-2"
          onClick={() => setShowTooltip(!showTooltip)}
        >
          <LoaderCircle className="animate-spin text-neutral-400" />
          {showTooltip && (
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-neutral-700 text-white text-sm px-2 py-1 rounded z-10 whitespace-nowrap">
              {!isModelReady ? "Waking up model..." : "Predicting result..."}
            </div>
          )}
        </div>
      ) : (
        <button
          className="p-2 bg-neutral-800 rounded-lg mt-2"
          onClick={() => setOnScan((prev) => !prev)}
        >
          <Scan className="text-neutral-400" />
        </button>
      )}
      <button
        className="p-2 bg-neutral-800 rounded-lg mt-2"
        onClick={() => setSatellite((prev) => !prev)}
      >
        {satellite ? (
          <Map className="text-neutral-400" />
        ) : (
          <Satellite className="text-neutral-400" />
        )}
      </button>
    </div>
  );
}
