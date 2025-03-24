/* eslint-disable react/jsx-props-no-spreading */
import { SpeedDial, SpeedDialAction } from '@mui/material';
import HighlightIcon from '@mui/icons-material/HighlightAlt';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import AddIcon from '@mui/icons-material/Add';

import { ThemeProvider } from '@mui/system';
import debounce from 'lodash/debounce';

import React, { useEffect, useState } from 'react';
import buildCskEntryTree from '../../helpers/buildCskEntryTree';
import { TreeProvider } from './tree-context';
import ElementHighlighter from './ElementHighlighter';
import Sidebar from './Sidebar';
import AddContentDialog from './AddContentDialog';
import './Sidekick.css';
import theme from '../../theme';
import useStorageState from '../../helpers/useStorageState';
import Banner from '../Banner';
import { ContentfulProvider } from '../../helpers/ContentfulContext';

const Sidekick = ({ defaultTree }) => {
  const [tree, setTree] = useState(defaultTree);
  const [show, setShow] = useStorageState(false, 'sidebarEnabled');
  const [highlight, setHighlight] = useStorageState(true, 'highlightEnabled');
  const [addToTemplate, setAddToTemplate] = useState(false);

  // Keep a reference to the latest tree for comparison
  const treeRef = React.useRef(tree);

  useEffect(() => {
    treeRef.current = tree;
  }, [tree]);

  useEffect(() => {
    const callback = debounce(() => {
      const newTree = buildCskEntryTree();

      // Compare trees more efficiently by checking length and top-level changes first
      const hasChanged =
        treeRef.current.length !== newTree.length ||
        newTree.some((node, index) => {
          const currentNode = treeRef.current[index];
          return (
            !currentNode ||
            currentNode.id !== node.id ||
            currentNode.uuid !== node.uuid ||
            currentNode.type !== node.type ||
            currentNode.field !== node.field ||
            JSON.stringify(currentNode.children) !== JSON.stringify(node.children)
          );
        });

      if (hasChanged) {
        setTree(newTree);
      }
    }, 100); // Reduced debounce time for more responsive updates

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let interval;
    let mutationObserver;

    if (MutationObserver) {
      mutationObserver = new MutationObserver((mutations) => {
        // Only trigger update if relevant attributes changed
        const shouldUpdate = mutations.some((mutation) => {
          return (
            (mutation.type === 'attributes' &&
              ((mutation.attributeName && mutation.attributeName.startsWith('data-csk-')) ||
                mutation.target.querySelector('[data-csk-entry-uuid]'))) ||
            mutation.type === 'childList'
          );
        });

        if (shouldUpdate) {
          callback();
        }
      });

      mutationObserver.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-csk-entry-id', 'data-csk-entry-type', 'data-csk-entry-field', 'data-csk-entry-uuid']
      });
    } else {
      interval = setInterval(callback, 1000); // Reduced interval time
      callback();
    }

    return () => {
      if (interval) clearInterval(interval);
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, []); // Keep empty dependency array since we use treeRef

  return (
    <ThemeProvider theme={theme}>
      <TreeProvider tree={tree}>
        <ContentfulProvider>
          <Banner />
          <SpeedDial
            size="medium"
            color="black"
            ariaLabel="LastRev Sidekick speed dial"
            sx={{ position: 'fixed', bottom: 0, left: 0, zIndex: 9999999999999999 }}
            FabProps={{
              sx: { borderRadius: '0px 10px 0px 0px' }
            }}
            icon={
              <svg
                version="1.0"
                xmlns="https://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                style={{ padding: '8px', fill: 'white' }}>
                <path d="M26.3 21.2c-1.2 1.4-7.8 14.1-10.5 20-1.3 2.8-1.4 3.8-.5 3.8 1.4 0 13.4-23.6 12.5-24.5-.3-.3-1 0-1.5.7zM32 33c0 4.7.4 8 1 8s1-1.5 1-3.4c0-7.2 4.2-12.3 7.4-9.1 1.6 1.7 3.6 2 3.6.6 0-1.6-3-4.1-4.8-4.1-1 0-2.8.7-4 1.6-2 1.4-2.2 1.4-2.2 0 0-.9-.4-1.6-1-1.6s-1 3.3-1 8zM5.8 29.8c-8.7 4.1-8.2 5 6 10.9.6.3 1.2 0 1.2-.6 0-.7-2-2.1-4.5-3.2S4 34.6 4 34.2c0-.5 2-1.8 4.5-3S13 28.6 13 28c0-1.4-.8-1.2-7.2 1.8zM49 28.1c0 .5 2.2 2 5 3.2 2.7 1.2 5 2.5 5 2.8 0 .4-2.2 1.6-5 2.7-2.7 1.2-5 2.6-5 3.1 0 1.5.5 1.4 7.1-1.6C59.7 36.7 62 35 62 34c0-.9-2.3-2.7-5.7-4.3-6.4-3-7.3-3.2-7.3-1.6z" />
              </svg>
            }>
            <SpeedDialAction
              icon={<HighlightIcon />}
              tooltipTitle={`${!highlight ? 'Enable' : 'Disable'} inspect content`}
              tooltipPlacement="right"
              color={highlight ? 'primary' : 'secondary'}
              onClick={() => setHighlight(!highlight)}
            />
            <SpeedDialAction
              icon={<ReadMoreIcon />}
              tooltipTitle={`${!show ? 'Enable' : 'Disable'} sidebar`}
              tooltipPlacement="right"
              color={highlight ? 'primary' : 'secondary'}
              onClick={() => setShow(!show)}
            />
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Add Section from Template"
              tooltipPlacement="right"
              onClick={() => setAddToTemplate({})}
              color={highlight ? 'primary' : 'secondary'}
            />
          </SpeedDial>
          <Sidebar show={show} tree={tree} />
          {highlight ? <ElementHighlighter setAddToTemplate={setAddToTemplate} /> : null}
          <AddContentDialog
            open={!!addToTemplate}
            {...addToTemplate}
            addToTemplate={addToTemplate}
            handleClose={() => setAddToTemplate()}
          />
        </ContentfulProvider>
      </TreeProvider>
    </ThemeProvider>
  );
};

export default Sidekick;
