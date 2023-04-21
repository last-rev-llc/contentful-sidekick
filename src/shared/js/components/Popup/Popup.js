import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import getIsSideKickEnabledFromStorage from '../../helpers/getIsSideKickEnabledFromStorage';
import setSideKickEnabledInStorage from '../../helpers/setSideKickEnabled';
import { ContentfulProvider, useContentfulContext } from '../../helpers/ContentfulContext';

import './Popup.css';

const { version } = require('../../../../../package.json');

function InnerPopup() {
  const [sideKickEnabled, setSideKickEnabled] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const { handleLogin, user, loaded: loadedAuth, handleLogout } = useContentfulContext();
  const handleChange = () => {
    const curSideKickEnabled = !sideKickEnabled;
    setSideKickEnabled(curSideKickEnabled);
    setSideKickEnabledInStorage(curSideKickEnabled);
    window.close();
  };

  useEffect(() => {
    async function setVars() {
      try {
        setSideKickEnabled(await getIsSideKickEnabledFromStorage());
        // verifiyAuth();
        setLoaded(true);
      } catch (error) {
        setLoaded(true);
      }
    }
    setVars();
  }, []);

  if (!loaded) return <div>Loading...</div>;

  return (
    <>
      <header>
        <div className="csk-h1">Contentful Sidekick</div>
        <img className="csk-lr-logo" src="../../../img/lr.png" width="30px" alt="Last Rev" />
      </header>
      <main>
        <div className="enable">
          <span>Enable Sidekick</span>
          <input type="checkbox" defaultChecked={sideKickEnabled} id="sideKickEnabled" onChange={handleChange} />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="sideKickEnabled" />
        </div>
        {/* <div>Is Enabled: {sideKickEnabled ? 'Yes' : 'No'}</div> */}
        <Box sx={{ opacity: loadedAuth ? 1 : 0, transition: '.3s' }}>
          {!user ? (
            <div>
              <p>Connect content management</p>
              <button type="submit" className="oauth-button" onClick={handleLogin}>
                Sign In
              </button>
            </div>
          ) : (
            <div>
              <p>User {user} Connected</p>
              <button type="submit" className="oauth-button" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </Box>
      </main>
      <footer>
        <small className="version">v{version}</small>
      </footer>
    </>
  );
}

const Popup = () => {
  return (
    <ContentfulProvider>
      <InnerPopup />
    </ContentfulProvider>
  );
};

export default Popup;
