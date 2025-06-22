import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import MainMap from "./pages/MainMap/MainMap.tsx";
import MobileSidebar from "./components/Sidebar/MobileSidebar.tsx";

export default function Layout() {
  const [satellite, setSatellite] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [prevSearch, setPrevSearch] = useState(searchQuery);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [onScan, setOnScan] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  function submitQuery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery === prevSearch) return;

    setPrevSearch(searchQuery);
    setSearchTrigger((prev) => prev + 1);
  }

  useEffect(() => {
    async function pingModel() {
      const response = await fetch("https://firecast-model.up.railway.app/", {
        method: "GET",
      });
      await response.json();
      setIsModelReady(true);
    }

    pingModel();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden border-transparent">
      <Navbar
        submitQuery={submitQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="relative flex-1 overflow-hidden border-transparent flex">
        <Sidebar
          setSatellite={setSatellite}
          satellite={satellite}
          setOnScan={setOnScan}
          isModelReady={isModelReady}
          isPredicting={isPredicting}
        />
        <MobileSidebar
          setSatellite={setSatellite}
          satellite={satellite}
          setOnScan={setOnScan}
          isModelReady={isModelReady}
          isPredicting={isPredicting}
        />
        <div className="flex-1 lg:ml-10 md:ml-10">
          <MainMap
            satellite={satellite}
            searchQuery={searchQuery}
            searchTrigger={searchTrigger}
            onScan={onScan}
            setOnScan={setOnScan}
            setIsPredicting={setIsPredicting}
          />
        </div>
      </div>
    </div>
  );
}
