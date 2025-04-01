import React from 'react';

export default (defaultValue, key) => {
  const [value, setValuestate] = React.useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return defaultValue;
    }
  });

  // Keep track of mounted state to prevent updates after unmount
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setValue = React.useCallback(
    newValue => {
      if (!isMounted.current) return;

      const valueToStore = typeof newValue === 'function' ? newValue(value) : newValue;
      setValuestate(valueToStore);

      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn('Error setting localStorage:', error);
      }
    },
    [key, value]
  );

  return [value, setValue];
};
