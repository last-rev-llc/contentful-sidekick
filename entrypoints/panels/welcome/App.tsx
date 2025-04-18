import React from "react";
import { navigateToPanel } from "../../utils/navigateToPanel";
import "./App.css";

export default function WelcomePanel() {
  return (
    <div className="welcome-panel">
      <h1>Welcome to Sidekick</h1>
      <div className="welcome-content">
        <p>
          This extension helps you navigate and interact with web pages more
          effectively.
        </p>

        <div className="feature-list">
          <h2>Features</h2>
          <ul>
            <li>
              <strong>Chatbot</strong>
              <p>Interact with AI to get help with your tasks</p>
            </li>
            <li>
              <strong>Element Tree</strong>
              <p>Navigate and inspect page elements easily</p>
            </li>
          </ul>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <button onClick={() => navigateToPanel("chatbot")}>
            Open Chatbot
          </button>
          <button onClick={() => navigateToPanel("element-tree")}>
            Open Element Tree
          </button>
        </div>
      </div>
    </div>
  );
}
