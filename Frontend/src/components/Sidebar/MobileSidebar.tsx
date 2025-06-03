import { Scan, Satellite, Map } from "lucide-react";

interface SidebarProps {
  satellite: boolean;
  setSatellite: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MobileSidebar({
  setSatellite,
  satellite,
}: SidebarProps) {
  return (
    <div className="mt-13 z-100 -2 gap absolute flex flex-col md:hidden right-0 mr-2">
      <button className="p-2 bg-neutral-800 rounded-lg">
        <Scan className="text-neutral-400" />
      </button>
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
