import React, { useState } from 'react';
import './Sidebar.css';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import { CSK_ENTRY_UUID_NAME } from '../../helpers/constants';

const calcElScrollTop = (el) => {
  const elOffset = el.offset().top;
  const elHeight = el.height();
  const windowHeight = $(window).height();
  return elHeight < windowHeight ? elOffset - (windowHeight / 2 - elHeight / 2) : elOffset;
};

function TreeNode({ id, field, type, displayText, uuid, childNodes }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const url = id ? getContentfulItemUrl(id) : null;
  const text = `${displayText || field || type || id}`;

  const el = $(`[data-${CSK_ENTRY_UUID_NAME}='${uuid}']`); // element referenced by this node
  const scrollTop = calcElScrollTop(el);

  const scrollToElement = () => {
    $('html, body').stop().animate({ scrollTop }, 300);
  };

  const handleMouseEnter = () => {
    $('#csk-overlay').addClass('show');
    el.addClass('csk-entry-unblur');

    scrollToElement();
  };

  const handleMouseLeave = () => {
    $('#csk-overlay').removeClass('show');
    el.removeClass('csk-entry-unblur');
  };

  const handleExpandCollapseClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <li className={`csk-sidebar-node ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {childNodes && childNodes.length ? (
        <span
          className="csk-expand-collapse-link"
          onClick={handleExpandCollapseClick}
          role="menuitem"
          tabIndex={0}
          onKeyDown={handleExpandCollapseClick}
        />
      ) : null}
      <span className="item" key="text" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {text}
      </span>
      {url ? (
        <span>
          <a href={url} target="_blank" rel="noreferrer">
            [Edit]
          </a>
        </span>
      ) : null}
      {childNodes && childNodes.length ? (
        <ul>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          {childNodes.map((childNode) => (
            <TreeNode
              key={uuid}
              id={childNode.id}
              field={childNode.field}
              type={childNode.type}
              displayText={childNode.displayText}
              uuid={childNode.uuid}
              childNodes={childNode.children}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Sidebar({ tree }) {
  return (
    <div className="csk-element-sidebar">
      {/* {loaded ? ( */}
      <ul>
        {tree.map((node) => {
          return (
            <TreeNode
              key={node.uuid}
              id={node.id}
              field={node.field}
              type={node.type}
              displayText={node.displayText}
              uuid={node.uuid}
              childNodes={node.children}
            />
          );
        })}
      </ul>
    </div>
  );
}

export default Sidebar;
