import React from 'react';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import { CSK_ENTRY_UUID_NAME } from '../../helpers/constants';
import { resetBlur, setBlur } from '../../helpers/blur';
import ErrorTooltip from './ErrorTooltip';
import { useNode, useTreeUpdater } from './tree-context';

const calcElScrollTop = (el) => {
  if (el && el.offset()) {
    const elOffset = el.offset().top;
    const elHeight = el.height();
    const windowHeight = $(window).height();
    return elHeight < windowHeight ? elOffset - (windowHeight / 2 - elHeight / 2) : elOffset;
  }
};

const TreeNode = ({ id, field, type, displayText, uuid, childNodes, errors }) => {
  const { isExpanded, isSelected } = useNode(uuid);
  const { setIsExpanded } = useTreeUpdater();
  const handleExpandCollapseClick = React.useCallback(() => {
    setIsExpanded(uuid, !isExpanded);
    setTimeout(() => {
      $('body').css('padding-left', $('.csk-element-sidebar').outerWidth(true));
    }, 0);
  }, [setIsExpanded, isExpanded]);
  const children = React.useMemo(
    () =>
      childNodes && childNodes.length ? (
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
            />
          ))}
        </ul>
      ) : null,
    [childNodes]
  );
  const el = React.useMemo(() => $(`[data-${CSK_ENTRY_UUID_NAME}='${uuid}']`), [uuid]);

  const scrollToElement = React.useCallback(() => {
    const scrollTop = calcElScrollTop(el);
    $('html, body').stop().animate({ scrollTop }, 300);
  }, [el]);

  const url = id ? getContentfulItemUrl(id) : null;
  const text = `${displayText || field || type || id}`;
  const handleMouseEnter = () => {
    setBlur(el);
    scrollToElement();
  };

  const handleMouseLeave = () => {
    resetBlur();
    el.removeClass('csk-entry-unblur');
  };

  return (
    <li className={`csk-sidebar-node ${isExpanded ? 'expanded' : 'collapsed'}`} onMouseEnter={handleMouseEnter}>
      <div className={`csk-item-group ${isSelected ? 'selected' : ''}`}>
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
      {children}
    </li>
  );
};

export default React.memo(TreeNode);
