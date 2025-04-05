import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, CircularProgress } from '@mui/material';
import { useNode } from './tree-context';
import { getContentfulItemUrl } from '../../helpers/getContentfulItemUrl';

export const TreeNode = memo(({ node, level }) => {
  const { isExpanded } = useNode(node.uuid);
  const hasChildren = node.children && node.children.length > 0;
  const [contentfulUrl, setContentfulUrl] = useState(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [error, setError] = useState(null);

  const nodeId = String(node.uuid || node.id); // Ensure nodeId is a string

  // Fetch the Contentful URL when the component mounts or when node.id changes
  useEffect(() => {
    if (node.id) {
      setIsLoadingUrl(true);
      getContentfulItemUrl(node.id)
        .then(url => {
          setContentfulUrl(url);
          setIsLoadingUrl(false);
        })
        .catch(err => {
          console.error('Error fetching Contentful URL:', err);
          setError(err.message);
          setIsLoadingUrl(false);
        });
    }
  }, [node.id]);

  const getLabel = () => {
    let label = '';
    if (node.displayText) label = node.displayText;
    else if (node.name) label = node.name;
    else if (node.type) label = `${node.type} #${nodeId}`;
    else label = `Item #${nodeId}`;

    return label;
  };

  const getIcon = () => {
    if (!hasChildren) return <InsertDriveFileIcon fontSize="small" />;
    return isExpanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />;
  };

  const handleEditClick = event => {
    event.stopPropagation();
    if (contentfulUrl) {
      window.open(contentfulUrl, '_blank');
    }
  };

  const renderButtonOrIndicator = () => {
    if (isLoadingUrl) {
      return <CircularProgress size={16} style={{ marginLeft: '8px' }} />;
    }

    if (error) {
      return (
        <span style={{ color: 'red', fontSize: '0.75rem', marginLeft: '8px' }}>
          Error loading URL
        </span>
      );
    }

    if (node.id) {
      return (
        <IconButton
          size="small"
          onClick={handleEditClick}
          style={{ marginLeft: '8px' }}
          disabled={!contentfulUrl}>
          <EditIcon fontSize="small" />
        </IconButton>
      );
    }

    return null;
  };

  return (
    <TreeItem
      id={nodeId}
      itemId={nodeId}
      label={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getLabel()}
          {renderButtonOrIndicator()}
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
