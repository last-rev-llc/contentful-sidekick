import React, { memo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { TreeStateContext } from './tree-context';
import TreeNode from './TreeNode';
import { logger } from '../../../../core/utils/logger';

const Tree = memo(() => {
  const tree = useContextSelector(TreeStateContext, state => state.tree);
  logger.debug('Tree received from context', { tree });

  // Filter out invalid nodes
  const validNodes = React.useMemo(() => {
    if (!Array.isArray(tree)) {
      logger.warn('Tree is not an array', { tree });
      return [];
    }
    const filtered = tree.filter(node => {
      const isValid = node && node.uuid;
      if (!isValid) {
        logger.warn('Invalid node filtered out', { node });
      }
      return isValid;
    });
    logger.debug('Node filtering complete', {
      originalLength: tree.length,
      filteredLength: filtered.length,
      nodes: filtered
    });
    return filtered;
  }, [tree]);

  if (!validNodes.length) {
    logger.debug('No valid nodes to render');
    return null;
  }

  return (
    <div className="tree">
      {validNodes.map(node => {
        logger.debug('Rendering tree node', { node });
        return <TreeNode key={node.uuid} node={node} level={0} />;
      })}
    </div>
  );
});

Tree.displayName = 'Tree';

export default Tree;
