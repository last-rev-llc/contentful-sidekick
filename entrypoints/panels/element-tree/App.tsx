import React from "react";
import { navigateToPanel } from "../../utils/navigateToPanel";
import "./App.css";

export default function ElementTreePanel() {
  return (
    <div className="element-tree-panel">
      <header className="element-tree-header">
        <h1>Element Tree</h1>
        <button onClick={() => navigateToPanel("welcome")}>
          Back to Welcome
        </button>
      </header>

      <div className="element-tree-content">
        <div className="toolbar">
          <button disabled>Refresh</button>
          <button disabled>Expand All</button>
          <button disabled>Collapse All</button>
        </div>

        <div className="tree-container">
          <div className="placeholder-message">
            <p>Element Tree functionality will be implemented soon.</p>
            <p>This panel will show the DOM structure of the current page.</p>
          </div>

          <div className="element-list">
            <div className="element-item">
              <span className="element-tag">&lt;html&gt;</span>
              <div className="element-children">
                <div className="element-item">
                  <span className="element-tag">&lt;head&gt;</span>
                </div>
                <div className="element-item">
                  <span className="element-tag">&lt;body&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
