import { Search } from "lucide-react";
import webIcon from "../../assets/webicon/firecast-icon.png";
import type { FormEvent, Dispatch, SetStateAction } from "react";

type NavbarProps = {
  submitQuery: (e: FormEvent<HTMLFormElement>) => void;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

export default function Navbar({
  searchQuery,
  submitQuery,
  setSearchQuery,
}: NavbarProps) {
  return (
    <div className="w-screen flex border-transparent">
      <div className="h-10 w-10 border-r-1 border-b-1 border-neutral-700 bg-neutral-800">
        <img src={webIcon} alt="" />
      </div>
      <div className="h-10 flex  justify-between white w-full items-center px-3 bg-neutral-800">
        <div className="flex font-semibold items-center">
          <p className="hidden text-xl font-bold text-neutral-200 lg:block md:block">
            FireCast
          </p>
        </div>
        <div className="flex bg-neutral-200/50 px-2 rounded-full py-1 items-center  shadow-xl">
          <Search className="text-neutral-200 size-4" />
          <form onSubmit={(e) => submitQuery(e)}>
            <input
              type="text"
              className="outline-none px-4 text-sm text-neutral-200"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
