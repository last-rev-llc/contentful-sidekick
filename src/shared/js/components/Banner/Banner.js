import React, { useEffect, useState } from 'react';
import './Banner.css';
import { useContentfulContext } from '../../helpers/ContentfulContext';

const Banner = () => {
  const [show, setShow] = useState(false);
  const { user } = useContentfulContext();

  useEffect(() => {
    const listener = (changes) => {
      if (changes.cma && changes.cma.newValue) {
        setShow(true);
      }
    };
    chrome.storage.sync.onChanged.addListener(listener);
    return () => {
      chrome.storage.sync.onChanged.removeListener(listener);
    };
  }, []);

  return (
    <>
      <div className={`banner ${show && user && 'show'}`}>
        <p>You are now logged in as {user}</p>
        <button type="button" onClick={() => setShow(false)}>
          X
        </button>
      </div>
    </>
  );
};

export default Banner;
