import React, { useEffect } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ElementTreePanel from '../ElementTree/ElementTreePanel';
import { ContentfulProvider, useContentfulContext } from '../../helpers/ContentfulContext';
import Login from '../Login/Login';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      id={`sidekick-tabpanel-${index}`}
      aria-labelledby={`sidekick-tab-${index}`}
      aria-hidden={value !== index}
      style={{
        height: 'calc(100% - 48px)',
        overflow: 'auto',
        display: value === index ? 'block' : 'none'
      }}>
      <Box sx={{ height: '100%' }}>{children}</Box>
    </div>
  );
}

function InnerSidePanel() {
  const [value, setValue] = React.useState(2); // Start with Element Tree tab active
  const { user, loaded } = useContentfulContext();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Reinitialize chatbot when user logs in
  useEffect(() => {
    if (user) {
      // Get current tab info to reinitialize chatbot
      chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
        if (tabs[0]) {
          // Import the chatbot initialization function
          const { getCurrentTabInfo } = await import('../../chatbot-init');
          await getCurrentTabInfo();
        }
      });
    }
  }, [user]);

  // Show loading state while auth state is being determined
  if (!loaded) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </Box>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <Login />;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="Sidekick tabs"
        variant="fullWidth"
        sx={{
          'borderBottom': 1,
          'borderColor': 'divider',
          '& .MuiTab-root': {
            minHeight: '48px'
          }
        }}>
        <Tab
          icon={<ChatIcon />}
          iconPosition="start"
          label="Chat"
          id="sidekick-tab-0"
          aria-controls="sidekick-tabpanel-0"
        />
        <Tab
          icon={<InfoIcon />}
          iconPosition="start"
          label="Page Info"
          id="sidekick-tab-1"
          aria-controls="sidekick-tabpanel-1"
        />
        <Tab
          icon={<AccountTreeIcon />}
          iconPosition="start"
          label="Element Tree"
          id="sidekick-tab-2"
          aria-controls="sidekick-tabpanel-2"
        />
      </Tabs>

      <TabPanel value={value} index={0}>
        <div id="chatbot-root" />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div className="page-info">
          <h3>Page Information</h3>
          <div className="page-info-section">
            <h4>URL</h4>
            <div className="url-content" />
          </div>
          <div className="contentful-info" />
        </div>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ElementTreePanel />
      </TabPanel>
    </Box>
  );
}

function SidePanel() {
  return (
    <ContentfulProvider>
      <InnerSidePanel />
    </ContentfulProvider>
  );
}

export default SidePanel;
