import React, { useEffect, useState } from "react";
import { PanelName } from "../utils/types";
import { ChatbotPanel } from "../panels/chatbot/ChatbotPanel";
import { WelcomePanel } from "../panels/welcome/WelcomePanel";
import { ElementTreePanel } from "../panels/element-tree/ElementTreePanel";
import { createRoot } from "react-dom/client";
import "./theme.css";

export const MainPanel: React.FC = () => {
  const [currentPanel, setCurrentPanel] = useState<PanelName>("welcome");

  useEffect(() => {
    // Get the panel from URL parameters
    const params = new URLSearchParams(window.location.search);
    const panelParam = params.get("panel") as PanelName;
    if (panelParam) {
      setCurrentPanel(panelParam);
    }
  }, []);

  const renderPanel = () => {
    switch (currentPanel) {
      case "chatbot":
        return <ChatbotPanel />;
      case "element-tree":
        return <ElementTreePanel />;
      default:
        return <WelcomePanel />;
    }
  };

  return (
    <div className="panel-container">
      <nav>
        <button onClick={() => setCurrentPanel("welcome")}>Welcome</button>
        <button onClick={() => setCurrentPanel("chatbot")}>Chatbot</button>
        <button onClick={() => setCurrentPanel("element-tree")}>
          Element Tree
        </button>
      </nav>
      <main>{renderPanel()}</main>
      <style>{`
        .panel-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: var(--color-background-default);
          color: var(--color-text-primary);
          overflow: hidden; /* Prevent scrolling on container */
        }
        nav {
          padding: var(--spacing-md);
          background: var(--color-background-paper);
          border-bottom: 1px solid var(--color-border-default);
          flex-shrink: 0; /* Prevent nav from shrinking */
        }
        nav button {
          margin-right: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          border: none;
          border-radius: var(--border-radius-sm);
          background: var(--color-background-default);
          color: var(--color-text-primary);
          cursor: pointer;
          box-shadow: var(--shadow-1);
          transition: all 0.2s ease;
        }
        nav button:hover {
          background: var(--color-background-hover);
        }
        main {
          flex: 1;
          min-height: 0; /* Important for flex child to respect container bounds */
          display: flex;
          flex-direction: column;
          overflow: hidden; /* Let child components handle their own scrolling */
        }
      `}</style>
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <MainPanel />
    </React.StrictMode>
  );
}
