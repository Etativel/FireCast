import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Layout from "./Layout.tsx";
import WeatherInfo from "./pages/WeatherInfo/WeatherInfo.tsx";
import PredictionPage from "./pages/prediction/PredictionPage.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";

const router = createBrowserRouter([
  {
    path: "/prediction",
    element: <PredictionPage />,
  },
  {
    path: "/",
    element: <Layout />,
  },
  { path: "/weather-info", element: <WeatherInfo /> },
  { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback="">
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);
