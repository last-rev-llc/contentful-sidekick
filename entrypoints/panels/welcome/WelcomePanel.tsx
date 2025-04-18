import React from "react";
import "./styles.css";

export const WelcomePanel: React.FC = () => {
  return (
    <div className="welcome-panel">
      <h1>Welcome to Sidekick</h1>
      <p>
        Your intelligent browser companion for web development and interaction.
      </p>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="feature">
          <h3>🤖 AI Chatbot</h3>
          <p>
            Get instant help with your tasks through our AI-powered chatbot.
            Perfect for:
          </p>
          <ul>
            <li>Asking questions about webpage content</li>
            <li>Reporting bugs and issues</li>
            <li>Getting assistance with web development tasks</li>
          </ul>
        </div>

        <div className="feature">
          <h3>🌳 Element Tree</h3>
          <p>Navigate and inspect page elements with ease:</p>
          <ul>
            <li>View the structure of any webpage</li>
            <li>Inspect specific elements and their properties</li>
            <li>Debug layout and styling issues</li>
          </ul>
        </div>

        <div className="feature">
          <h3>💡 Quick Tips</h3>
          <ul>
            <li>
              Click the Sidekick icon in your browser toolbar to open/close the
              panel
            </li>
            <li>Use Alt+R to reload the extension during development</li>
            <li>Navigate between panels using the menu at the top</li>
          </ul>
        </div>
      </div>

      <style>{`
     
       
        // .welcome-panel {
        //   padding: 2rem;
        //   max-width: 800px;
        //   margin: 0 auto;
        //   color: #333;
        // }

        // h1 {
        //   font-size: 2rem;
        //   margin-bottom: 1rem;
        //   color: #2563eb;
        // }

        // h2 {
        //   font-size: 1.5rem;
        //   margin: 2rem 0 1rem;
        //   color: #1e40af;
        // }

        // h3 {
        //   font-size: 1.2rem;
        //   margin: 1.5rem 0 0.5rem;
        //   color: #1e40af;
        // }

        // .features-section {
        //   margin-top: 2rem;
        // }

        // .feature {
        //   background: #f8fafc;
        //   border-radius: 8px;
        //   padding: 1.5rem;
        //   margin-bottom: 1.5rem;
        //   border: 1px solid #e2e8f0;
        // }

        // ul {
        //   margin: 0.5rem 0;
        //   padding-left: 1.5rem;
        // }

        // li {
        //   margin: 0.5rem 0;
        //   line-height: 1.5;
        // }

        // p {
        //   margin: 0.5rem 0;
        //   line-height: 1.6;
        // }
      `}</style>
    </div>
  );
};
