import React, { memo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { TreeStateContext } from './tree-context';
import TreeNode from './TreeNode';

const Tree = memo(() => {
  const tree = useContextSelector(TreeStateContext, state => state.tree);
  console.log('Tree received from context:', tree);

  // Filter out invalid nodes
  const validNodes = React.useMemo(() => {
    if (!Array.isArray(tree)) {
      console.warn('Tree is not an array:', tree);
      return [];
    }
    const filtered = tree.filter(node => {
      const isValid = node && node.uuid;
      if (!isValid) {
        console.warn('Filtering out invalid node:', node);
      }
      return isValid;
    });
    console.log('Filtered nodes:', {
      originalLength: tree.length,
      filteredLength: filtered.length,
      nodes: filtered
    });
    return filtered;
  }, [tree]);

  if (!validNodes.length) {
    console.log('No valid nodes to render');
    return null;
  }

  return (
    <div className="tree">
      {validNodes.map(node => {
        console.log('Rendering node:', node);
        return <TreeNode key={node.uuid} node={node} level={0} />;
      })}
    </div>
  );
});

Tree.displayName = 'Tree';

export { Tree };
