import React, { useEffect } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HighlightIcon from '@mui/icons-material/HighlightAlt';
import { TreeNode } from './TreeNode';
import { logger } from '../../../../core/utils/logger';

export function Sidebar({ tree }) {
  const nodes = React.useMemo(
    () => tree && tree.map(node => <TreeNode key={node.uuid} node={node} level={0} />),
    [tree]
  );

  const [expanded, setExpanded] = React.useState([]);

  // Initialize highlight state based on DOM state
  const checkInitialHighlightState = () => {
    // Check if highlight elements exist in DOM
    return document.querySelector('[id^="csk-blur"]') !== null;
  };

  const [highlight, setHighlight] = React.useState(checkInitialHighlightState());

  // Check and synchronize highlight state when component mounts
  useEffect(() => {
    const initialState = checkInitialHighlightState();
    if (initialState !== highlight) {
      setHighlight(initialState);
    }
  }, []);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleHighlightToggle = () => {
    const newHighlightState = !highlight;
    setHighlight(newHighlightState);

    // Send message to content script to toggle highlight
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: 'TOGGLE_HIGHLIGHT',
            enabled: newHighlightState
          })
          .catch(error => {
            logger.error('Error sending highlight toggle message:', error);
          });
      }
    });
  };

  return (
    <div
      className="csk-element-sidebar"
      style={{ position: 'static', width: '100%', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px' }}>
        <Tooltip title={highlight ? 'Disable Highlight' : 'Enable Highlight'}>
          <IconButton
            size="small"
            onClick={handleHighlightToggle}
            color={highlight ? 'primary' : 'default'}>
            <HighlightIcon />
          </IconButton>
        </Tooltip>
      </div>
      <SimpleTreeView
        aria-label="Element Tree"
        expandedItems={expanded}
        onExpandedItemsChange={handleToggle}
        sx={{
          'height': 'calc(100% - 48px)',
          'flexGrow': 1,
          'maxWidth': '100%',
          'overflowY': 'auto',
          'padding': '8px',
          '& .MuiTreeItem-root': {
            padding: 0
          },
          '& .MuiTreeItem-group': {
            marginLeft: 0,
            borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
            marginTop: '2px',
            marginBottom: '2px'
          }
        }}>
        {nodes}
      </SimpleTreeView>
    </div>
  );
}
