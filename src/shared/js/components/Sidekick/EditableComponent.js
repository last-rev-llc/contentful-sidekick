import React, { useState, useEffect, Children, isValidElement, cloneElement } from 'react';

export const EditableComponent = ({ children, ...props }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isEditable = document.querySelector('meta[name="isEditable"]');
    if (isEditable) {
      setShow(true);
    }
  }, []);

  return show
    ? Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { ...props });
        }
        return child;
      })
    : null;
};
