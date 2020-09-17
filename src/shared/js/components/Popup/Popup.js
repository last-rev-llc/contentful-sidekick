import React, { useEffect, useState } from 'react';
import getIsSideKickEnabledFromStorage from '../../helpers/getIsSideKickEnabledFromStorage';
import setSideKickEnabledInStorage from '../../helpers/setSideKickEnabled';
import './Popup.css';

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
      </main>
      <footer>
        <small className="version">v0.0.9</small>
      </footer>
    </>
  );
}

export default Popup;
