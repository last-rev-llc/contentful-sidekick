/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import throttle from 'lodash/throttle';
import { useContextSelector } from 'use-context-selector';
import IconEdit from '@mui/icons-material/Edit';
import IconMoveUp from '@mui/icons-material/ArrowUpward';
import IconMoveDown from '@mui/icons-material/ArrowDownward';
import IconDelete from '@mui/icons-material/Delete';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import { resetBlur, setBlur } from '../../helpers/blur';
import { resetSelectedOutline, setSelectedOutline } from '../../helpers/selected';
import { CSK_ENTRY_ID_NAME, CSK_ENTRY_SELECTOR, CSK_ENTRY_UUID_NAME } from '../../helpers/constants';
import { TreeStateContext, useTreeUpdater } from './tree-context';
import { Box, Button, Paper, styled, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import removeContentFromIndex from '../../helpers/removeContentFromIndex';
import reorderContent from '../../helpers/reorderContent';
import useContentful from '../../helpers/useContentful';

const ElementHighlighter = ({ setAddToTemplate }) => {
  const [pageId, setPageId] = React.useState('');
  React.useLayoutEffect(() => {
    // TODO read this from a meta tag. This assumes on preview route
    const pageParams = new URLSearchParams(window.location.search);
    setPageId(pageParams.get('id'));
  }, []);
  const { tree, setSelected } = useTreeUpdater();

  const [sections, setSections] = React.useState([]);
  const selectedPath = useContextSelector(TreeStateContext, (context) => context.selectedPath);
  const [active, setActive] = React.useState(0);
  React.useLayoutEffect(() => {
    const handleCskEntryMouseenter = throttle((e) => {
      if (!e.target) return;
      const $ct = $(e.target);
      let id = $ct.data(CSK_ENTRY_ID_NAME);
      let url = id ? getContentfulItemUrl(id, selectedPath) : null;
      let uuid = $(e.target).data(CSK_ENTRY_UUID_NAME);
      if (!uuid) {
        // The mouse enter target might not be the element with sidekick props
        // So we look for it on the parents
        const $parentEl = $(e.target).parents(`[data-${CSK_ENTRY_UUID_NAME}]`);
        uuid = $($parentEl[0]).data(CSK_ENTRY_UUID_NAME);
        id = $($parentEl[0]).data(CSK_ENTRY_ID_NAME);
        url = id ? getContentfulItemUrl(id, selectedPath) : null;
      }
      setBlur($(e.target), url);

      // setSelected(uuid);
    }, 300);
    const handleCskEntryClick = throttle((e) => {
      if (!e.target) return;
      e.stopPropagation();
      e.preventDefault();
      const $ct = $(e.target);
      let id = $ct.data(CSK_ENTRY_ID_NAME);
      let url = id ? getContentfulItemUrl(id, selectedPath) : null;
      let uuid = $(e.target).data(CSK_ENTRY_UUID_NAME);
      if (!uuid) {
        // The mouse enter target might not be the element with sidekick props
        // So we look for it on the parents
        const $parentEl = $(e.target).parents(`[data-${CSK_ENTRY_UUID_NAME}]`);
        uuid = $($parentEl[0]).data(CSK_ENTRY_UUID_NAME);
        id = $($parentEl[0]).data(CSK_ENTRY_ID_NAME);
        url = id ? getContentfulItemUrl(id, selectedPath) : null;
      }
      // setBlur($(e.target), url);

      setSelected(uuid);
      // setSelectedOutline($(e.target), url);
      resetBlur();
    }, 300);

    const handleCskEntryMouseleave = throttle((e) => {
      if (e.toElement && e.toElement.getAttribute('id') === 'csk-blur-actions') {
        return;
      }
      if (!e.target) {
        return;
      }
      // setSelected();
      resetBlur();
    }, 300);

    const handleActionsMouseleave = throttle((e) => {
      if (e.toElement && $(CSK_ENTRY_SELECTOR).is(e.toElement)) {
        return;
      }
      resetBlur();
      // setSelected();
    }, 300);
    if (setSelected) {
      $('body')
        .on('click', CSK_ENTRY_SELECTOR, handleCskEntryClick)
        .on('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
        .on('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave)
        .on('mouseover', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter);

      $('#csk-blur-actions').on('mouseleave', handleActionsMouseleave);
    }
    // debugger;

    return () => {
      if (setSelected) {
        $('body')
          .off('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
          .off('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave)
          .off('mouseover', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter);

        $('#csk-blur-actions').on('mouseleave', handleActionsMouseleave);
      }
    };
  }, [setSelected, selectedPath]);
  React.useLayoutEffect(() => {
    const onResize = throttle(() => {
      const elSections = document.querySelectorAll('section');
      const mappedSections = Array.from(elSections).map((section) => {
        const boundingRect = section.getBoundingClientRect();
        return {
          ...section,
          cskEntryId: section.getAttribute('data-csk-entry-id'),
          boundingRect,
          top: window.scrollY + boundingRect.top,
          bottom: window.scrollY + boundingRect.bottom
        };
      });
      // console.log('MappedSections', mappedSections);
      setSections(mappedSections);
    }, 300);
    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [tree]);
  React.useLayoutEffect(() => {
    const onMouseMove = throttle((evt) => {
      //Iterate over sections and set the correct section to active depending on the mouse y position
      const elSections = document.querySelectorAll('section');
      const mappedSections = Array.from(elSections).map((section) => {
        const boundingRect = section.getBoundingClientRect();
        return {
          ...section,
          boundingRect,
          top: boundingRect.top,
          bottom: boundingRect.bottom
        };
      });

      mappedSections.map((section, idx) => {
        if (evt.clientY >= section.top && evt.clientY <= section.bottom && idx !== active) {
          setActive(idx);
        }
        if (evt.clientY < section.top && idx === active) {
          setActive();
        }
        if (evt.clientY >= section.bottom && idx === active) {
          setActive();
        }
      });
    }, 300);

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [active, tree]);
  return (
    <>
      {['top', 'bottom', 'left', 'right'].map((dir) => (
        <div
          id={`csk-blur-${dir}`}
          key={dir}
          className={`csk-blur csk-blur-${dir}`}
          onClick={() => {
            resetSelectedOutline();
            setSelected();
          }}
        />
      ))}
      {/* {['top', 'bottom', 'left', 'right'].map((dir) => (
        <div
          onClick={() => resetSelectedOutline()}
          id={`csk-selected-${dir}`}
          key={dir}
          className={`csk-selected csk-selected-${dir}`}
        />
      ))} */}

      {sections.map((section, index) => (
        <SectionUI
          key={section.cskEntryId}
          active={index === active}
          section={section}
          index={index}
          setAddToTemplate={setAddToTemplate}
          pageId={pageId}
        />
      ))}
      <div id="csk-blur-actions">
        <a id="csk-edit-link" target="_blank">
          Edit
        </a>
        {/* <a id="csk-template">Template</a> */}
      </div>
      <div id="csk-selected-actions">
        {/* <a id="csk-edit-link" target="_blank">
          Edit
        </a> */}
        {/* <a id="csk-template">Template</a> */}
      </div>
    </>
  );
};

const SectionUI = ({ pageId, section, setAddToTemplate, index, active }) => {
  // const [active, setActive] = React.useState(false);
  const { environment: client } = useContentful();
  const handleDelete = async () => {
    try {
      await removeContentFromIndex({ pageId, index, field: 'contents', client });
    } catch (err) {
      console.log('Delete error', err);
    }
  };

  const handleOpen = () => {
    console.log('HandleOpen', { self: window.self, top: window.top });
    if (window.self !== window.top) {
      window.parent.postMessage(
        {
          type: 'NAVIGATE_TO',
          payload: {
            url: getContentfulItemUrl(section.cskEntryId)
          }
        },
        '*'
      );
      // window.location.href = getContentfulItemUrl(section.cskEntryId);
      window.open(getContentfulItemUrl(section.cskEntryId));
    } else {
      window.open(getContentfulItemUrl(section.cskEntryId));
    }
  };
  return (
    <SectionUIContainer
      className="csk-section"
      active={active}
      // onMouseLeave={() => setActive(false)}
      // onMouseEnter={() => setActive(true)}
      sx={{
        position: 'absolute',

        top: section.top,
        bottom: section.bottom,
        left: section.boundingRect.left,
        right: section.boundingRect.right
      }}>
      <SectionInner
        style={{
          position: 'absolute',
          height: section.boundingRect.height,
          width: section.boundingRect.width
        }}>
        <AddSectionButton
          sx={{ top: 0, left: '50%', transform: 'translateX(-50%) translateY(-50%)' }}
          variant="contained"
          onClick={() => setAddToTemplate({ index })}>
          Add section
        </AddSectionButton>
        <AddSectionButton
          sx={{ bottom: 0, left: '50%', transform: 'translateX(-50%) translateY(50%)' }}
          variant="contained"
          onClick={() => setAddToTemplate({ index: index + 1 })}>
          Add section
        </AddSectionButton>

        <Paper sx={{ right: 16, top: 16, left: 'auto', position: 'absolute' }} variant="contained">
          <ToggleButtonGroup size="small">
            <ToggleButton sx={{ width: 40, height: 40 }} onClick={handleOpen}>
              <Tooltip title={`Edit`}>
                <IconEdit />
              </Tooltip>
            </ToggleButton>
            <ToggleButton sx={{ width: 40, height: 40 }} onClick={handleDelete}>
              <Tooltip title={`Delete`}>
                <IconDelete sx={{ color: 'danger.main' }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              sx={{ width: 40, height: 40 }}
              onClick={() => reorderContent({ pageId, from: index, to: index - 1 })}>
              <Tooltip title={`MoveUp`}>
                <IconMoveUp />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              sx={{ width: 40, height: 40 }}
              onClick={() => reorderContent({ pageId, from: index, to: index + 1 })}>
              <Tooltip title={`MoveDown`}>
                <IconMoveDown />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </SectionInner>
    </SectionUIContainer>
  );
};
const SectionUIContainer = styled('div')`
  position: absolute;
  z-index: 999;
  opacity: 0;
  height: 0;
  pointer-events: none;
  transition: 0.2s;
  opacity: ${({ active }) => (active ? 1 : 0)};
  &:hover {
    opacity: 1;
  }
`;
const SectionInner = styled('div')`
  position: relative;
  &::before {
    content: '';
    border: 3px solid ${({ theme }) => theme.palette.primary.main};
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  pointer-events: none;
  * {
    pointer-events: auto;
    transition: 0.2s;
  }
`;
const AddSectionButton = styled(Button)`
  position: absolute !important;

  font-size: 12px;
`;

export default ElementHighlighter;
