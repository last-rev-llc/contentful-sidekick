import React, { createContext, useContext, useState } from 'react';

// Create a simple context
const TreeContext = createContext({
  tree: [],
  expandedNodes: new Set(),
  selectedNode: null
});

// Hook to access node state
export const useNode = uuid => {
  const context = useContext(TreeContext);

  return {
    isExpanded: context.expandedNodes.has(uuid),
    isSelected: context.selectedNode === uuid
  };
};

// Provider component
export function TreeProvider({ children, tree = [] }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);

  const value = {
    tree,
    expandedNodes,
    selectedNode,
    setExpandedNodes,
    setSelectedNode
  };

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
}

export { TreeContext };
