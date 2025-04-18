import React, { useState, useEffect } from "react";
import type { TreeNodeProps } from "./types";
import { getContentfulItemUrl } from "./utils";

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
    </div>
  );
};
