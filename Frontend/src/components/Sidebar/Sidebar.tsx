import { Scan, Satellite, Map, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
interface SidebarProps {
  satellite: boolean;
  isModelReady: boolean;
  isPredicting: boolean;
  setSatellite: React.Dispatch<React.SetStateAction<boolean>>;
  setOnScan: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
  setSatellite,
  satellite,
  setOnScan,
  isModelReady,
  isPredicting,
}: SidebarProps) {
  useEffect(() => {
    console.log(isPredicting);
  }, [isPredicting]);
  return (
    <div className="hidden  md:absolute md:left-0 md:top-0 md:w-10 md:h-full md:flex md:flex-col md:items-center md:border-transparent md:py-5 md:gap-5 md:bg-neutral-800">
      {!isModelReady || isPredicting ? (
        <div className="relative group">
          <LoaderCircle className="animate-spin text-neutral-400" />
          <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-neutral-700 text-white text-md px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            {!isModelReady ? "Waking up model..." : "Predicting result..."}
          </div>
        </div>
      ) : (
        <button onClick={() => setOnScan((prev) => !prev)}>
          <Scan className="text-neutral-400" />
        </button>
      )}
      <button
        className="cursor-pointer"
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
