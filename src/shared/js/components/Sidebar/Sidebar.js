import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import { CSK_ENTRY_UUID_NAME } from '../../helpers/constants';
import { resetBlur, setBlur } from '../../helpers/blur';
import buildCskEntryTree from '../../helpers/buildCskEntryTree';

const calcElScrollTop = (el) => {
  const elOffset = el.offset().top;
  const elHeight = el.height();
  const windowHeight = $(window).height();
  return elHeight < windowHeight ? elOffset - (windowHeight / 2 - elHeight / 2) : elOffset;
};

function TreeNode({ id, field, type, displayText, uuid, childNodes, isExpanded, setIsExpanded }) {
  const url = id ? getContentfulItemUrl(id) : null;
  const text = `${displayText || field || type || id}`;

  const el = $(`[data-${CSK_ENTRY_UUID_NAME}='${uuid}']`); // element referenced by this node
  const scrollTop = calcElScrollTop(el);

  const scrollToElement = () => {
    $('html, body').stop().animate({ scrollTop }, 300);
  };

  const handleMouseEnter = () => {
    setBlur(el);
    scrollToElement();
  };

  const handleMouseLeave = () => {
    resetBlur();
    el.removeClass('csk-entry-unblur');
  };

  const handleExpandCollapseClick = () => {
    setIsExpanded(uuid, !isExpanded(uuid));
    setTimeout(() => {
      $('body').css('padding-left', $('.csk-element-sidebar').outerWidth(true));
    }, 0);
  };

  return (
    <li className={`csk-sidebar-node ${isExpanded(uuid) ? 'expanded' : 'collapsed'}`}>
      <div className="csk-item-group">
        {childNodes && childNodes.length ? (
          <span
            className="csk-icon-expand"
            onClick={handleExpandCollapseClick}
            onKeyDown={handleExpandCollapseClick}
            role="menuitem"
            tabIndex={0}
          />
        ) : null}
        <span
          className="csk-item"
          onMouseEnter={scrollToElement}
          onMouseLeave={handleMouseLeave}
          onClick={handleExpandCollapseClick}
          onKeyDown={handleExpandCollapseClick}
          role="menuitem"
          tabIndex={0}>
          {text}
        </span>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="edit">
            Edit
          </a>
        )}
        <a href={url} target="_blank" rel="noreferrer" className="view" onMouseEnter={handleMouseEnter}>
          View
        </a>
      </div>
      {childNodes && childNodes.length ? (
        <ul>
          {childNodes.map((childNode) => (
            <TreeNode
              key={childNode.uuid}
              id={childNode.id}
              field={childNode.field}
              type={childNode.type}
              displayText={childNode.displayText}
              uuid={childNode.uuid}
              childNodes={childNode.children}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Sidebar({ defaultTree }) {
  const [tree, setTree] = useState(defaultTree);
  const [expandedState, setExpandedState] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTree(buildCskEntryTree());
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const isExpanded = (uuid) => {
    return !!expandedState[uuid];
  };

  const setIsExpanded = (uuid, state) => {
    setExpandedState({ ...expandedState, [uuid]: state });
  };

  return (
    <div className="csk-element-sidebar">
      <div className="csk-h1">
        <span>Contentful Sidekick</span>
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <path d="M26.3 21.2c-1.2 1.4-7.8 14.1-10.5 20-1.3 2.8-1.4 3.8-.5 3.8 1.4 0 13.4-23.6 12.5-24.5-.3-.3-1 0-1.5.7zM32 33c0 4.7.4 8 1 8s1-1.5 1-3.4c0-7.2 4.2-12.3 7.4-9.1 1.6 1.7 3.6 2 3.6.6 0-1.6-3-4.1-4.8-4.1-1 0-2.8.7-4 1.6-2 1.4-2.2 1.4-2.2 0 0-.9-.4-1.6-1-1.6s-1 3.3-1 8zM5.8 29.8c-8.7 4.1-8.2 5 6 10.9.6.3 1.2 0 1.2-.6 0-.7-2-2.1-4.5-3.2S4 34.6 4 34.2c0-.5 2-1.8 4.5-3S13 28.6 13 28c0-1.4-.8-1.2-7.2 1.8zM49 28.1c0 .5 2.2 2 5 3.2 2.7 1.2 5 2.5 5 2.8 0 .4-2.2 1.6-5 2.7-2.7 1.2-5 2.6-5 3.1 0 1.5.5 1.4 7.1-1.6C59.7 36.7 62 35 62 34c0-.9-2.3-2.7-5.7-4.3-6.4-3-7.3-3.2-7.3-1.6z" />
        </svg>
      </div>
      <div className="csk-h2">Page Elements</div>
      {/* {loaded ? ( */}
      <ul>
        {tree &&
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
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />
            );
          })}
      </ul>
    </div>
  );
}

export default Sidebar;
