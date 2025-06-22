import { Scan, Satellite, Map } from "lucide-react";

interface SidebarProps {
  satellite: boolean;
  setSatellite: React.Dispatch<React.SetStateAction<boolean>>;
  setOnScan: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
  setSatellite,
  satellite,
  setOnScan,
}: SidebarProps) {
  return (
    <div className="hidden  md:absolute md:left-0 md:top-0 md:w-10 md:h-full md:flex md:flex-col md:items-center md:border-transparent md:py-5 md:gap-5 md:bg-neutral-800">
      <button onClick={() => setOnScan((prev) => !prev)}>
        <Scan className="text-neutral-400" />
      </button>
      <button onClick={() => setSatellite((prev) => !prev)}>
        {satellite ? (
          <Map className="text-neutral-400" />
        ) : (
          <Satellite className="text-neutral-400" />
        )}
      </button>
    </div>
  );
}
