import React from "react";
import { createRoot } from "react-dom/client";
import { WelcomePanel } from "./WelcomePanel";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <WelcomePanel />
    </React.StrictMode>
  );
}
