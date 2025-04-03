import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { useContextSelector } from 'use-context-selector';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNode, TreeStateContext } from './tree-context';
import { setBlur, resetBlur } from '../../helpers/blur';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';

const TreeNode = memo(({ node, level }) => {
  const { isExpanded, isSelected } = useNode(node.uuid);
  const hasChildren = node.children && node.children.length > 0;
  const setIsExpanded = useContextSelector(TreeStateContext, state => state.setIsExpanded);
  const setSelected = useContextSelector(TreeStateContext, state => state.setSelected);
  const selectedPath = useContextSelector(TreeStateContext, state => state.selectedPath);

  const handleToggle = e => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(node.uuid, !isExpanded);
    }
  };

  const handleSelect = e => {
    e.stopPropagation();
    setSelected(node.uuid);
  };

  const handleMouseEnter = e => {
    const url = node.id ? getContentfulItemUrl(node.id, selectedPath) : null;
    if (url) {
      setBlur($(e.currentTarget), url);
    }
  };

  const handleMouseLeave = () => {
    resetBlur();
  };

  const labelContent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
      <span>{node.displayText || node.type || node.field || 'Unnamed Element'}</span>
      {node.id && (
        <Tooltip title="Edit in Contentful">
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              window.open(getContentfulItemUrl(node.id, selectedPath), '_blank');
            }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );

  return (
    <TreeItem2
      itemId={node.uuid}
      label={labelContent}
      expandable={hasChildren}
      expanded={isExpanded}
      selected={isSelected}
      onExpandClick={handleToggle}
      onClick={handleSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        '& .MuiTreeItem-content': {
          'padding': '4px 8px',
          'paddingLeft': `${(level + 1) * 16}px`,
          'borderRadius': '4px',
          '&:hover': {
            backgroundColor: 'rgba(145, 70, 255, 0.08)'
          },
          '&.Mui-selected': {
            'backgroundColor': 'rgba(145, 70, 255, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(145, 70, 255, 0.2)'
            }
          }
        },
        '& .MuiTreeItem-label': {
          fontSize: '13px',
          color: '#333',
          width: '100%'
        },
        '& .MuiTreeItem-iconContainer': {
          'color': 'rgba(0, 0, 0, 0.54)',
          '&:hover': {
            color: 'rgba(0, 0, 0, 0.87)'
          }
        },
        '& .MuiTreeItem-group': {
          'marginLeft': '0px',
          '& .MuiTreeItem-content': {
            paddingLeft: `${(level + 2) * 16}px`
          }
        }
      }}>
      {hasChildren &&
        node.children.map(child => <TreeNode key={child.uuid} node={child} level={level + 1} />)}
    </TreeItem2>
  );
});

TreeNode.propTypes = {
  node: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    id: PropTypes.string,
    displayText: PropTypes.string,
    type: PropTypes.string,
    field: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        uuid: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  level: PropTypes.number.isRequired
};

TreeNode.displayName = 'TreeNode';

export default TreeNode;
