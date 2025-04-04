import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import { useNode } from './tree-context';
import { getContentfulItemUrl } from '../../helpers/getContentfulItemUrl';

export const TreeNode = memo(({ node, level }) => {
  const { isExpanded } = useNode(node.uuid);
  const hasChildren = node.children && node.children.length > 0;

  const nodeId = String(node.uuid || node.id); // Ensure nodeId is a string

  const getLabel = () => {
    let label = '';
    if (node.displayText) label = node.displayText;
    else if (node.name) label = node.name;
    else if (node.type) label = `${node.type} #${nodeId}`;
    else label = `Item #${nodeId}`;

    const url = getContentfulItemUrl(node.id);
    return url ? `${label} (${url})` : label;
  };

  const getIcon = () => {
    if (!hasChildren) return <InsertDriveFileIcon fontSize="small" />;
    return isExpanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />;
  };

  const handleEditClick = event => {
    event.stopPropagation();
    const url = getContentfulItemUrl(node.id);
    if (url) window.open(url, '_blank');
  };

  return (
    <TreeItem
      id={nodeId}
      itemId={nodeId}
      label={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getLabel()}
          <IconButton size="small" onClick={handleEditClick} style={{ marginLeft: '8px' }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </div>
      }
      icon={getIcon()}
      sx={{
        'marginLeft': level * 8,
        '& .MuiTreeItem-content': {
          'padding': '4px 8px',
          'borderRadius': '4px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)'
          }
        }
      }}>
      {hasChildren &&
        node.children.map((childNode, index) => (
          <TreeNode key={childNode.uuid || index} node={childNode} level={level + 1} />
        ))}
    </TreeItem>
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
