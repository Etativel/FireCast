import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import MainMap from "./pages/MainMap/MainMap.tsx";

export default function Layout() {
  const [satellite, setSatellite] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden border-transparent">
      <Navbar />

      <div className="relative flex-1 overflow-hidden border-transparent">
        <Sidebar setSatellite={setSatellite} satellite={satellite} />

        <div className="absolute inset-y-0 right-0 left-10 border-transparent">
          <MainMap satellite={satellite} />
        </div>
      </div>
    </div>
  );
}
