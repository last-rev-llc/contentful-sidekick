import React from 'react';
import TreeNode from './TreeNode';

const Sidebar = ({ tree, show }) => {
  const nodes = React.useMemo(
    () =>
      tree &&
      tree.map((node) => {
        return (
          <TreeNode
            key={node.uuid}
            id={node.id}
            field={node.field}
            type={node.type}
            displayText={node.displayText}
            uuid={node.uuid}
            childNodes={node.children}
            errors={node.errors}
          />
        );
      }),
    [tree]
  );
  return (
    <div className={`csk-element-sidebar ${show ? 'show' : ''}`}>
      <div className="csk-h1">
        <span>Contentful Sidekick</span>
        <svg version="1.0" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <path d="M26.3 21.2c-1.2 1.4-7.8 14.1-10.5 20-1.3 2.8-1.4 3.8-.5 3.8 1.4 0 13.4-23.6 12.5-24.5-.3-.3-1 0-1.5.7zM32 33c0 4.7.4 8 1 8s1-1.5 1-3.4c0-7.2 4.2-12.3 7.4-9.1 1.6 1.7 3.6 2 3.6.6 0-1.6-3-4.1-4.8-4.1-1 0-2.8.7-4 1.6-2 1.4-2.2 1.4-2.2 0 0-.9-.4-1.6-1-1.6s-1 3.3-1 8zM5.8 29.8c-8.7 4.1-8.2 5 6 10.9.6.3 1.2 0 1.2-.6 0-.7-2-2.1-4.5-3.2S4 34.6 4 34.2c0-.5 2-1.8 4.5-3S13 28.6 13 28c0-1.4-.8-1.2-7.2 1.8zM49 28.1c0 .5 2.2 2 5 3.2 2.7 1.2 5 2.5 5 2.8 0 .4-2.2 1.6-5 2.7-2.7 1.2-5 2.6-5 3.1 0 1.5.5 1.4 7.1-1.6C59.7 36.7 62 35 62 34c0-.9-2.3-2.7-5.7-4.3-6.4-3-7.3-3.2-7.3-1.6z" />
        </svg>
      </div>
      <div className="csk-h2">Page Elements</div>
      {/* {loaded ? ( */}
      <ul>{nodes}</ul>
    </div>
  );
};

export default React.memo(Sidebar);
