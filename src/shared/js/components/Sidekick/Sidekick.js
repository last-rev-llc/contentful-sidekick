/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/system';
// import debounce from 'lodash/debounce';

// import { buildCskEntryTree } from '../../helpers/buildCskEntryTree';
import { TreeProvider } from './tree-context';
import { ElementHighlighter } from './ElementHighlighter';
// import { Sidebar } from './Sidebar';
// import { AddContentDialog } from './AddContentDialog';
import { theme } from '../../theme';
import { useStorageState } from '../../helpers/useStorageState';
// import { Banner } from '../Banner';
import { ContentfulProvider } from '../../helpers/ContentfulContext';

function InnerSidekick({ defaultTree }) {
  // const [tree, setTree] = useState(defaultTree);
  // const [show] = useStorageState(false, 'sidebarEnabled');
  const [highlight, setHighlight] = useStorageState(false, 'highlightEnabled');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [addToTemplate, setAddToTemplate] = useState(false);
  // const [, setTemplatesAvailable] = useState(false);

  // Keep a reference to the latest tree for comparison
  // const treeRef = React.useRef(tree);

  // useEffect(() => {
  //   treeRef.current = tree;
  // }, [tree]);

  // Check authentication state on mount and when it changes
  useEffect(() => {
    const checkAuth = async () => {
      const result = await new Promise(resolve => {
        chrome.storage.sync.get(['cma'], data => {
          resolve(!!data.cma);
        });
      });
      setIsAuthenticated(result);
      if (!result) {
        setHighlight(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const authListener = changes => {
      if (changes.cma) {
        setIsAuthenticated(!!changes.cma.newValue);
        if (!changes.cma.newValue) {
          setHighlight(false);
        }
      }
    };

    chrome.storage.onChanged.addListener(authListener);
    return () => {
      chrome.storage.onChanged.removeListener(authListener);
    };
  }, [setHighlight]);

  // useEffect(() => {
  //   const callback = debounce(() => {
  //     const newTree = buildCskEntryTree();

  //     // Compare trees more efficiently by checking length and top-level changes first
  //     const hasChanged =
  //       treeRef.current.length !== newTree.length ||
  //       newTree.some((node, index) => {
  //         const currentNode = treeRef.current[index];
  //         return (
  //           !currentNode ||
  //           currentNode.id !== node.id ||
  //           currentNode.uuid !== node.uuid ||
  //           currentNode.type !== node.type ||
  //           currentNode.field !== node.field ||
  //           JSON.stringify(currentNode.children) !== JSON.stringify(node.children)
  //         );
  //       });

  //     if (hasChanged) {
  //       setTree(newTree);
  //     }
  //   }, 500); // Increased debounce time for less frequent updates

  //   const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  //   let interval;
  //   let mutationObserver;

  //   if (MutationObserver) {
  //     mutationObserver = new MutationObserver(mutations => {
  //       // Only trigger update if relevant attributes changed
  //       const shouldUpdate = mutations.some(mutation => {
  //         // Check if this is a relevant attribute change
  //         if (mutation.type === 'attributes') {
  //           const attr = mutation.attributeName;
  //           return (
  //             attr &&
  //             (attr === 'data-csk-entry-id' ||
  //               attr === 'data-csk-entry-type' ||
  //               attr === 'data-csk-entry-field' ||
  //               attr === 'data-csk-entry-uuid')
  //           );
  //         }

  //         // For childList changes, only update if the added/removed nodes contain CSK entries
  //         if (mutation.type === 'childList') {
  //           const addedHasCskEntry = Array.from(mutation.addedNodes).some(
  //             node =>
  //               node.nodeType === 1 &&
  //               (node.hasAttribute('data-csk-entry-uuid') ||
  //                 node.querySelector('[data-csk-entry-uuid]'))
  //           );
  //           const removedHasCskEntry = Array.from(mutation.removedNodes).some(
  //             node =>
  //               node.nodeType === 1 &&
  //               (node.hasAttribute('data-csk-entry-uuid') ||
  //                 node.querySelector('[data-csk-entry-uuid]'))
  //           );
  //           return addedHasCskEntry || removedHasCskEntry;
  //         }

  //         return false;
  //       });

  //       if (shouldUpdate) {
  //         callback();
  //       }
  //     });

  //     mutationObserver.observe(document.body, {
  //       childList: true,
  //       subtree: true,
  //       attributes: true,
  //       attributeFilter: [
  //         'data-csk-entry-id',
  //         'data-csk-entry-type',
  //         'data-csk-entry-field',
  //         'data-csk-entry-uuid'
  //       ]
  //     });
  //   } else {
  //     interval = setInterval(callback, 2000); // Increased interval time
  //     callback();
  //   }

  //   return () => {
  //     callback.cancel();
  //     if (interval) clearInterval(interval);
  //     if (mutationObserver) mutationObserver.disconnect();
  //   };
  // }, []);

  return (
    <TreeProvider tree={tree}>
      {/* <Banner /> */}
      {/* <Sidebar show={show} tree={tree} /> */}
      {highlight && isAuthenticated ? (
        <ElementHighlighter setAddToTemplate={setAddToTemplate} />
      ) : null}
      {/* <AddContentDialog
        open={!!addToTemplate}
        {...addToTemplate}
        addToTemplate={addToTemplate}
        handleClose={() => setAddToTemplate()}
        onTemplatesAvailable={setTemplatesAvailable}
      /> */}
    </TreeProvider>
  );
}

export function Sidekick({ defaultTree }) {
  return (
    <ThemeProvider theme={theme}>
      <ContentfulProvider>
        <InnerSidekick defaultTree={defaultTree} />
      </ContentfulProvider>
    </ThemeProvider>
  );
}
