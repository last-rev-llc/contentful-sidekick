import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, ChevronDown } from '@mui/icons-material';
import { useContextSelector } from 'use-context-selector';
import { useNode, TreeStateContext } from './tree-context';

const TreeNode = memo(({ node, level }) => {
  const { isExpanded, isSelected } = useNode(node.uuid);
  const hasChildren = node.children && node.children.length > 0;
  const setIsExpanded = useContextSelector(TreeStateContext, state => state.setIsExpanded);
  const setSelected = useContextSelector(TreeStateContext, state => state.setSelected);

  const handleToggle = useCallback(
    e => {
      e.stopPropagation();
      if (hasChildren) {
        setIsExpanded(node.uuid, !isExpanded);
      }
    },
    [hasChildren, isExpanded, node, setIsExpanded]
  );

  const handleSelect = useCallback(
    e => {
      e.stopPropagation();
      setSelected(node.uuid);
    },
    [node.uuid, setSelected]
  );

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelected(node.uuid);
      }
    },
    [node.uuid, setSelected]
  );

  const handleToggleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (hasChildren) {
          setIsExpanded(node.uuid, !isExpanded);
        }
      }
    },
    [hasChildren, isExpanded, node.uuid, setIsExpanded]
  );

  return (
    <div className="tree-node">
      <div
        className={`tree-node-content ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}>
        {hasChildren && (
          <div
            className="toggle"
            onClick={handleToggle}
            onKeyDown={handleToggleKeyDown}
            role="button"
            tabIndex={0}>
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </div>
        )}
        <div className="label">{node.label || node.name}</div>
      </div>
      {hasChildren && isExpanded && (
        <div className="children">
          {node.children.map(child => (
            <TreeNode key={child.uuid} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
});

TreeNode.propTypes = {
  node: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    label: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        uuid: PropTypes.string.isRequired,
        label: PropTypes.string,
        name: PropTypes.string
      })
    )
  }).isRequired,
  level: PropTypes.number.isRequired
};

TreeNode.displayName = 'TreeNode';

export default TreeNode;
