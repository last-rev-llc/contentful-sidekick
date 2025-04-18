import React from "react";
import { createRoot } from "react-dom/client";
import { ElementTreePanel } from "./ElementTreePanel";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <ElementTreePanel />
    </React.StrictMode>
  );
}
