import React from "react";
import { navigateToPanel } from "../../utils/navigateToPanel";
import "./App.css";

export default function ChatbotPanel() {
  return (
    <div className="chatbot-panel">
      <header className="chatbot-header">
        <h1>Chatbot</h1>
        <button onClick={() => navigateToPanel("welcome")}>
          Back to Welcome
        </button>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          <div className="message bot">
            <div className="message-content">
              <p>Hello! This is a placeholder for the chatbot interface.</p>
              <p>The actual chat functionality will be implemented soon.</p>
            </div>
          </div>
        </div>

        <div className="chat-input">
          <textarea placeholder="Type your message here..." disabled />
          <button disabled>Send</button>
        </div>
      </div>
    </div>
  );
}
