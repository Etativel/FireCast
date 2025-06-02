import { Scan, Satellite, Map } from "lucide-react";

interface SidebarProps {
  satellite: boolean;
  setSatellite: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ setSatellite, satellite }: SidebarProps) {
  return (
    <div className="absolute left-0 top-0 w-10 h-full flex flex-col items-center border-transparent py-5 gap-5 bg-neutral-800">
      <button>
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
