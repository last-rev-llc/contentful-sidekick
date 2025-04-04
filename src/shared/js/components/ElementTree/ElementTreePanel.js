import React from 'react';
import { Sidebar } from '../Sidekick/Sidebar';
import { useElementTree } from '../../hooks/useElementTree';

export function ElementTreePanel() {
  const { elementTree, isLoading, error } = useElementTree();

  if (isLoading) {
    return <div className="element-tree-loading">Loading...</div>;
  }

  if (error) {
    return <div className="element-tree-error">{error}</div>;
  }

  if (!elementTree || elementTree.length === 0) {
    return <div className="element-tree-empty">No elements found</div>;
  }

  return <Sidebar tree={elementTree} />;
}
