import React, { useMemo, useCallback } from 'react';
import { createContext as createContextSelector, useContextSelector } from 'use-context-selector';

const TreeStateContext = createContextSelector({
  tree: [],
  selectedPath: [],
  expandedNodes: new Set(),
  selectedNode: null,
  setIsExpanded: () => {},
  setSelected: () => {}
});

export const useNode = uuid => {
  const expandedNodes = useContextSelector(TreeStateContext, state => state.expandedNodes);
  const selectedNode = useContextSelector(TreeStateContext, state => state.selectedNode);

  return {
    isExpanded: expandedNodes.has(uuid),
    isSelected: selectedNode === uuid
  };
};

export const useTreeUpdater = () => {
  const [state, setState] = React.useState({
    selectedPath: [],
    expandedNodes: new Set(),
    selectedNode: null
  });

  const setIsExpanded = useCallback((uuid, isExpanded) => {
    if (!uuid) return;
    setState(prevState => ({
      ...prevState,
      expandedNodes: isExpanded
        ? new Set([...prevState.expandedNodes, uuid])
        : new Set([...prevState.expandedNodes].filter(id => id !== uuid))
    }));
  }, []);

  const setSelected = useCallback(uuid => {
    setState(prevState => ({
      ...prevState,
      selectedNode: uuid || null
    }));
  }, []);

  return {
    ...state,
    setIsExpanded,
    setSelected
  };
};

export function TreeProvider({ children, tree = [] }) {
  const { setIsExpanded, setSelected, ...state } = useTreeUpdater();

  const contextValue = useMemo(
    () => ({
      ...state,
      tree,
      setIsExpanded,
      setSelected
    }),
    [state, tree, setIsExpanded, setSelected]
  );

  return <TreeStateContext.Provider value={contextValue}>{children}</TreeStateContext.Provider>;
}

export { TreeStateContext };
