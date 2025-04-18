import React, { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { TreeNode } from "./TreeNode";
import { buildElementTree } from "./utils";
import type { TreeNode as TreeNodeType } from "./types";

export const ElementTreePanel: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNodeType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildTree = async () => {
    try {
      console.log("[Element Tree] Starting tree build in component");
      setIsLoading(true);
      setError(null);
      const tree = await buildElementTree();
      console.debug("[Element Tree] Received tree data:", {
        treeLength: tree.length,
        nodes: tree.map((n) => ({
          id: n.id,
          type: n.type,
        })),
      });
      setTreeData(tree);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to build element tree";
      console.error("[Element Tree] Error building element tree:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.debug("[Element Tree] Tree build complete, state:", {
        isLoading: false,
        hasError: error !== null,
        treeDataLength: treeData.length,
      });
    }
  };

  useEffect(() => {
    console.debug("[Element Tree] Component mounted, initializing tree");
    buildTree();

    // Listen for tab updates
    const handleTabUpdate = (
      tabId: number,
      changeInfo: { status?: string }
    ) => {
      if (changeInfo.status === "complete") {
        console.info("[Element Tree] Tab updated, rebuilding element tree");
        buildTree();
      }
    };

    // Listen for tab activation changes
    const handleTabActivation = () => {
      console.info(
        "[Element Tree] Active tab changed, rebuilding element tree"
      );
      buildTree();
    };

    browser.tabs.onUpdated.addListener(handleTabUpdate);
    browser.tabs.onActivated.addListener(handleTabActivation);

    return () => {
      console.debug(
        "[Element Tree] Component unmounting, cleaning up listeners"
      );
      browser.tabs.onUpdated.removeListener(handleTabUpdate);
      browser.tabs.onActivated.removeListener(handleTabActivation);
    };
  }, []);

  console.debug("[Element Tree] Rendering component", {
    isLoading,
    hasError: error !== null,
    treeDataLength: treeData.length,
  });

  return (
    <div className="element-tree-panel">
      <div className="header">
        <button
          className="refresh-button"
          onClick={buildTree}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh Tree"}
        </button>
      </div>
      <div className="content">
        {isLoading && <div className="message">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {!isLoading && !error && (!treeData || treeData.length === 0) && (
          <div className="message">No elements found</div>
        )}
        {!isLoading && !error && treeData && treeData.length > 0 && (
          <div className="tree-container">
            {treeData.map((node) => (
              <TreeNode key={node.id} node={node} level={0} />
            ))}
          </div>
        )}
      </div>
      <style>{`
        .element-tree-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--color-background-default);
          color: var(--color-text-primary);
        }
        .header {
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--color-border-default);
          background: var(--color-background-paper);
        }
        .refresh-button {
          padding: var(--spacing-sm) var(--spacing-md);
          border: none;
          border-radius: var(--border-radius-sm);
          background: var(--color-primary);
          color: var(--color-text-on-primary);
          cursor: pointer;
          font-weight: 500;
          box-shadow: var(--shadow-1);
          transition: all 0.2s ease;
        }
        .refresh-button:hover:not(:disabled) {
          background: var(--color-primary-dark);
        }
        .refresh-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .content {
          flex: 1;
          padding: var(--spacing-md);
          overflow-y: auto;
        }
        .message {
          padding: var(--spacing-lg);
          text-align: center;
          color: var(--color-text-secondary);
        }
        .error-message {
          padding: var(--spacing-lg);
          text-align: center;
          color: var(--color-error);
          background: var(--color-error-light);
          border-radius: var(--border-radius-md);
          margin: var(--spacing-md) 0;
        }
        .tree-container {
          padding: var(--spacing-sm);
        }
      `}</style>
    </div>
  );
};
