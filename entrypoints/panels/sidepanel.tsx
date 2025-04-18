import React from "react";
import { createRoot } from "react-dom/client";
import { MainPanel } from "./MainPanel";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <MainPanel />
    </React.StrictMode>
  );
}
