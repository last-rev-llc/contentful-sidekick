import React, { useState, useEffect } from "react";
import type { TreeNodeProps } from "./types";
import { getContentfulItemUrl } from "./utils";
import "../../styles/theme.css";

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  parentPath = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentfulUrl, setContentfulUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchContentfulUrl = async () => {
      if (node.id) {
        try {
          // Include all parent paths up to this node
          const currentPath = [...parentPath];
          const url = await getContentfulItemUrl(node.id, currentPath);
          setContentfulUrl(url);
        } catch (error) {
          console.error("Error fetching Contentful URL:", error);
        }
      }
    };

    fetchContentfulUrl();
  }, [node.id, parentPath]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const displayText = node.displayText || node.field || node.type || node.id;

  // Create the path for child nodes by adding the current node's ID
  const childPath = node.id ? [...parentPath, { id: node.id }] : parentPath;

  return (
    <div className="tree-node">
      <div
        className={`node-header ${isHovered ? "is-hovered" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="node-content"
          onClick={handleToggle}
          title={node.field ? `Field: ${node.field}` : `ID: ${node.id}`}
        >
          <span className="expand-icon">
            {node.children?.length ? (isExpanded ? "▼" : "▶") : ""}
          </span>

          {displayText && <span className="node-id">{displayText}</span>}
        </div>
        {contentfulUrl && (
          <a
            href={contentfulUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="edit-link"
            onClick={(e) => e.stopPropagation()}
            title="Edit in Contentful"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </a>
        )}
      </div>
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="node-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.uuid}
              node={child}
              level={level + 1}
              parentPath={childPath}
            />
          ))}
        </div>
      )}
      <style>{`
        .tree-node {
          margin: var(--spacing-xs) 0;
          font-family: var(--font-family-mono);
        }
        .node-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          background: var(--color-background-paper);
          transition: all 0.2s ease;
          position: relative;
        }
        .node-header:hover,
        .node-header.is-hovered {
          background: var(--color-background-hover);
        }
        .node-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
          cursor: pointer;
          flex: 1;
          min-width: 0;
          padding-right: var(--spacing-md);
        }
        .expand-icon {
          margin-right: var(--spacing-sm);
          color: var(--color-text-secondary);
          font-size: 0.8em;
          min-width: 1em;
          text-align: center;
          flex-shrink: 0;
        }
        .node-type {
          color: var(--color-primary);
          font-weight: 500;
        }
        .node-field {
          color: var(--color-text-secondary);
          font-size: 0.9em;
          padding: 2px var(--spacing-xs);
          background: var(--color-background-subtle);
          border-radius: var(--border-radius-xs);
          flex-shrink: 0;
        }
        .node-id {
          color: var(--color-text-tertiary);
          font-size: 0.9em;
          font-family: var(--font-family-mono);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .node-children {
          margin-left: var(--spacing-lg);
          padding-left: var(--spacing-sm);
          border-left: 1px solid var(--color-border-subtle);
        }
        .edit-link {
          display: none;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xs);
          color: var(--color-text-secondary);
          position: absolute;
          right: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          border-radius: var(--border-radius-sm);
          background: var(--color-background-paper);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .node-header:hover .edit-link,
        .node-header.is-hovered .edit-link {
          display: flex;
        }
        .edit-link:hover {
          color: var(--color-primary);
          background: var(--color-background-hover);
          transform: translateY(-50%) scale(1.1);
        }
        .edit-link svg {
          display: block;
        }
      `}</style>
    </div>
  );
};
