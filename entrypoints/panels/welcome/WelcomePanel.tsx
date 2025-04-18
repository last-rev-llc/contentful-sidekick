import React from "react";

export const WelcomePanel: React.FC = () => {
  return (
    <div className="welcome-panel">
      <h2>Welcome to Sidekick</h2>
      <p>Select a panel from the navigation above to get started.</p>
      <style>{`
        .welcome-panel {
          padding: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
