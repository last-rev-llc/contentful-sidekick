import React from "react";
import { createRoot } from "react-dom/client";
import { ChatbotPanel } from "./ChatbotPanel";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <ChatbotPanel />
    </React.StrictMode>
  );
}
