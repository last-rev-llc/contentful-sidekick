import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export const TreeStateContext = createContext({
  selected: null,
  expandedState: {},
  selectedPath: []
});

const TreeUpdaterContext = createContext({
  setSelected: () => {},
  setExpandedState: () => {}
});

const getPath = ({ node, uuid }) => {
  if (node.uuid == uuid) {
    return [node];
  }
  if (node.children && node.children.length) {
    for (const child of node.children) {
      const path = getPath({ node: child, uuid });
      if (path.length) {
        return [...path, node];
      }
    }
  }
  return [];
};

function TreeProvider({ tree, children }) {
  const [selected, setSelected] = React.useState();
  const [expandedState, setExpandedState] = React.useState({});
  const selectedPath = React.useMemo(() => {
    const path = getPath({ uuid: selected, node: { children: tree } });
    return path;
  }, [selected, JSON.stringify(tree)]);

  const setIsExpanded = React.useCallback(
    (uuid, expanded) => {
      setExpandedState({
        ...expandedState,
        [uuid]: expanded
      });
    },
    [expandedState, setExpandedState]
  );

  return (
    <TreeStateContext.Provider value={{ selected, selectedPath, expandedState }}>
      <TreeUpdaterContext.Provider value={{ setSelected, setIsExpanded, setExpandedState }}>
        {children}
      </TreeUpdaterContext.Provider>
    </TreeStateContext.Provider>
  );
}

const useTreeUpdater = () => {
  const setSelected = useContextSelector(TreeUpdaterContext, (context) => context.setSelected);
  const setIsExpanded = useContextSelector(TreeUpdaterContext, (context) => context.setIsExpanded);
  if (typeof setSelected === 'undefined') {
    throw new Error('useTreeUpdater must be used within a TreeProvider');
  }

  return {
    setSelected,
    setIsExpanded
  };
};

const useNode = (uuid) => {
  const expanded = useContextSelector(TreeStateContext, (context) => context.expandedState[uuid]);
  const selectedPath = useContextSelector(TreeStateContext, (context) => context.selectedPath);
  const selected = useContextSelector(TreeStateContext, (context) => context.selected);

  const isExpanded = React.useMemo(() => expanded || (selected && selectedPath.find((n) => n.uuid === uuid)), [
    uuid,
    expanded,
    selected,
    selectedPath
  ]);
  const isSelected = React.useMemo(() => uuid === selected, [uuid, selected]);
  return {
    isExpanded,
    isSelected
  };
};

export { TreeProvider, useNode, useTreeUpdater };
