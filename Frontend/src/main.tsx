import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Layout from "./Layout.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback="">
      <RouterProvider router={router} />
    </Suspense>{" "}
  </StrictMode>
);
