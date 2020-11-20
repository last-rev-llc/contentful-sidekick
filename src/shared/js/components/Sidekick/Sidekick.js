import React, { useEffect, useState } from 'react';
import './Sidekick.css';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import { CSK_ENTRY_UUID_NAME } from '../../helpers/constants';
import { resetBlur, setBlur } from '../../helpers/blur';
import buildCskEntryTree from '../../helpers/buildCskEntryTree';
import { ElementHighlighter } from './ElementHighlighter';
import ErrorTooltip from './ErrorTooltip';

const calcElScrollTop = (el) => {
  if(el && el.offset()){
    const elOffset = el.offset().top;
    const elHeight = el.height();
    const windowHeight = $(window).height();
    return elHeight < windowHeight ? elOffset - (windowHeight / 2 - elHeight / 2) : elOffset;
  }
};

function TreeNode({
  id,
  field,
  type,
  displayText,
  uuid,
  childNodes,
  errors,
  isExpanded,
  setIsExpanded,
  setSelected,
  selected
}) {
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
    <li className={`csk-sidebar-node ${isExpanded(uuid) ? 'expanded' : 'collapsed'}`} onMouseEnter={handleMouseEnter}>
      <div className={`csk-item-group ${selected == uuid ? 'selected' : ''}`}>
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
        {errors && Object.keys(errors).length ? <ErrorTooltip field={field} errors={errors} /> : null}
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="edit">
            Edit
          </a>
        )}
        {/* <a href={url} target="_blank" rel="noreferrer" className="view" onMouseEnter={handleMouseEnter}>
          View
        </a> */}
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
              errors={{
                ...(errors && errors[childNode.field] ? { [childNode.field]: errors[childNode.field] } : {}),
                ...childNode.errors
              }}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              setSelected={setSelected}
              selected={selected}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

const getPath = ({ node, uuid }) => {
  if (node.uuid == uuid) {
    return [uuid];
  }
  if (node.children.length) {
    for (const child of node.children) {
      const path = getPath({ node: child, uuid });
      if (path.length) {
        return [...path, node.uuid];
      }
    }
  }
  return [];
};

function Sidebar({ defaultTree }) {
  const [tree, setTree] = useState(defaultTree);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState();
  const [expandedState, setExpandedState] = useState({});
  const selectedPath = React.useMemo(() => getPath({ uuid: selected, node: { children: tree } }), [selected, tree]);
  const isExpanded = React.useCallback(
    (uuid) => {
      return expandedState[uuid] || (selected && selectedPath.includes(uuid));
    },
    [expandedState, selected, selectedPath]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTree(buildCskEntryTree());
    }, 3000);
    setTimeout(() => setShow(true), 300);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const setIsExpanded = (uuid, state) =>
    setExpandedState((x) => ({
      ...x,
      [uuid]: state
    }));

  return (
    <>
      <div className={`csk-element-sidebar ${show ? 'show' : ''}`}>
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
                  errors={node.errors}
                  isExpanded={isExpanded}
                  setIsExpanded={setIsExpanded}
                  setSelected={setSelected}
                  selected={selected}
                />
              );
            })}
        </ul>
      </div>
      <ElementHighlighter setSelected={setSelected} selected={selected} setIsExpanded={setIsExpanded} />
    </>
  );
}

export default Sidebar;
