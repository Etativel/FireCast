import { Scan } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="absolute left-0 top-0 w-10 h-full flex flex-col items-center border-transparent py-5">
      <button>
        <Scan className="text-neutral-400" />
      </button>
    </div>
  );
}
