import React, { useEffect, useState } from 'react';
import getIsSideKickEnabledFromStorage from '../../helpers/getIsSideKickEnabledFromStorage';
import setSideKickEnabledInStorage from '../../helpers/setSideKickEnabled';
import './Popup.css';

const { version } = require('../../../../../package.json');

function Popup() {
  const [sideKickEnabled, setSideKickEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function setVars() {
      setSideKickEnabled(await getIsSideKickEnabledFromStorage());
      setLoaded(true);
    }
    setVars();
  }, []);

  const handleChange = () => {
    const curSideKickEnabled = !sideKickEnabled;
    setSideKickEnabled(curSideKickEnabled);
    setSideKickEnabledInStorage(curSideKickEnabled);
    window.close();
  };

  const handleOauth = () => {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url: "https://be.contentful.com/oauth/authorize?response_type=token&client_id=WccRf7M_eDzfIgOrC1gFKBEi4Pae7w1lw_LbQZHiK4U&redirect_uri=https://cmheemjjmooepppggclooeejginffobo.chromiumapp.org&scope=content_management_manage"
      },
      (token) => {
        let cma = token.split('=')[1];
        cma = cma.substring(0,cma.indexOf('&'));
        console.log(cma);
        chrome.storage.sync.set({cma});
      }
    );
  };

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
        <div>Is Enabled: {sideKickEnabled ? 'Yes' : 'No'}</div>
        <div><button type="submit" className="oauth-button" onClick={handleOauth}>OAUTH</button></div>
        
      </main>
      <footer>
        <small className="version">v{version}</small>
      </footer>
    </>
  );
}

export default Popup;
