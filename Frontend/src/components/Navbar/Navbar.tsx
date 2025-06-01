import { Search } from "lucide-react";
import webIcon from "../../assets/webicon/firecast-icon.png";

export default function Navbar() {
  return (
    <div className="w-screen flex border-transparent">
      <div className="h-10 w-10 border-r-1 border-b-1 border-neutral-200">
        <img src={webIcon} alt="" />
      </div>
      <div className="h-10 flex  justify-between white w-full items-center px-3">
        <div className="flex font-semibold items-center">
          <p className="hidden text-xl font-bold text-neutral-700 lg:block md:block">
            FireCast
          </p>
        </div>
        <div className="flex bg-neutral-200/50 px-2 rounded-full py-1 items-center  shadow-xl">
          <Search className="text-neutral-600 size-4" />
          <input
            type="text"
            className="outline-none px-4 text-sm"
            placeholder="Search..."
          />
        </div>
      </div>
    </div>
  );
}
