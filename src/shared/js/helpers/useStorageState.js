import React from 'react';
export default (defaultValue, key) => {
  const [value, setValuestate] = React.useState(localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : defaultValue);
  // React.useEffect(() => {
  // chrome.storage.sync.get([key], (storageValue) => {
  //   if (typeof storageValue[key] !== 'undefined') {
  //     setValuestate(storageValue[key]);
  //   }
  // });

  // chrome.storage.onChanged.addListener((changes) => {
  //   if (changes[key] && changes[key].newValue !== changes[key].oldValue) {
  //     setValuestate(changes[key].newValue);
  //   }
  // });
  // }, [defaultValue]);

  const setValue = newValue => {
    setValuestate(newValue);
    localStorage.setItem(key, newValue);
    // TODO: The next line makes the extension disappear without error
    // chrome.storage.sync.set({ [key]: newValue });

  };
  return [value, setValue];
};
