import React, { useEffect, useState } from 'react';
import buildCskEntryTree from '../../helpers/buildCskEntryTree';
import { TreeProvider } from './tree-context';

import ElementHighlighter from './ElementHighlighter';
import Sidebar from './Sidebar';
import './Sidekick.css';

const Sidekick = ({ defaultTree }) => {
  const [tree, setTree] = useState(defaultTree);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTree = buildCskEntryTree();
      if (JSON.stringify(tree) !== JSON.stringify(newTree)) {
        setTree(newTree);
      }
    }, 3000);
    setTimeout(() => setShow(true), 300);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <TreeProvider tree={tree}>
      <>
        <Sidebar show={show} tree={tree} />
        <ElementHighlighter />
      </>
    </TreeProvider>
  );
};

export default Sidekick;
