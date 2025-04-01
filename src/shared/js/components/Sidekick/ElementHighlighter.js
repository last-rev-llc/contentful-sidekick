/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import throttle from 'lodash/throttle';
import { useContextSelector } from 'use-context-selector';
import IconEdit from '@mui/icons-material/Edit';
import IconMoveUp from '@mui/icons-material/ArrowUpward';
import IconMoveDown from '@mui/icons-material/ArrowDownward';
import IconDelete from '@mui/icons-material/Delete';
import BugReportIcon from '@mui/icons-material/BugReport';
import {
  Button,
  Paper,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton
} from '@mui/material';

import { resetBlur, setBlur } from '../../helpers/blur';
import { resetSelectedOutline } from '../../helpers/selected';
import {
  CSK_ENTRY_ID_NAME,
  CSK_ENTRY_SELECTOR,
  CSK_ENTRY_UUID_NAME
} from '../../helpers/constants';
import { TreeStateContext, useTreeUpdater } from './tree-context';
import { useContentfulContext } from '../../helpers/ContentfulContext';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import BugReporter from '../BugReporter/BugReporter';

function ElementHighlighter({ setAddToTemplate }) {
  const [pageId, setPageId] = React.useState('');
  const [selectedBugElement, setSelectedBugElement] = React.useState(null);
  const [selectedBugInfo, setSelectedBugInfo] = React.useState(null);
  const [sections, setSections] = React.useState([]);
  const [active, setActive] = React.useState(0);

  const { setSelected } = useTreeUpdater();
  const selectedPath = useContextSelector(TreeStateContext, context => context.selectedPath);

  // Memoize event handlers
  const handleCskEntryMouseenter = React.useMemo(
    () =>
      throttle(e => {
        if (!e.target) return;
        const $ct = $(e.target);
        let id = $ct.data(CSK_ENTRY_ID_NAME);
        let url = id ? getContentfulItemUrl(id, selectedPath) : null;
        let uuid = $(e.target).data(CSK_ENTRY_UUID_NAME);
        if (!uuid) {
          const $parentEl = $(e.target).parents(`[data-${CSK_ENTRY_UUID_NAME}]`);
          uuid = $($parentEl[0]).data(CSK_ENTRY_UUID_NAME);
          id = $($parentEl[0]).data(CSK_ENTRY_ID_NAME);
          url = id ? getContentfulItemUrl(id, selectedPath) : null;
        }

        const computedFontSize = window.getComputedStyle($ct[0]).fontSize;
        const numericFontSize = parseFloat(computedFontSize) * 0.5;
        let overlayFontSize = `${numericFontSize}px`;

        if (numericFontSize < 11) {
          overlayFontSize = '11px';
        } else if (numericFontSize > 16) {
          overlayFontSize = '16px';
        }

        $('#csk-blur-actions').css('font-size', overlayFontSize);
        setBlur($(e.target), url);
      }, 300),
    [selectedPath]
  );

  const handleCskEntryClick = React.useMemo(
    () =>
      throttle(e => {
        if (e.target !== e.currentTarget) return;
        e.stopPropagation();
        e.preventDefault();
        let uuid = $(e.target).data(CSK_ENTRY_UUID_NAME);
        if (!uuid) {
          const $parentEl = $(e.target).parents(`[data-${CSK_ENTRY_UUID_NAME}]`);
          uuid = $($parentEl[0]).data(CSK_ENTRY_UUID_NAME);
        }
        setSelected(uuid);
        resetBlur();
      }, 300),
    [setSelected]
  );

  const handleCskEntryMouseleave = React.useMemo(
    () =>
      throttle(e => {
        if (e.toElement && e.toElement.getAttribute('id') === 'csk-blur-actions') {
          return;
        }
        if (!e.target) {
          return;
        }
        resetBlur();
      }, 300),
    []
  );

  const handleActionsMouseleave = React.useMemo(
    () =>
      throttle(e => {
        if (e.toElement && $(CSK_ENTRY_SELECTOR).is(e.toElement)) {
          return;
        }
        resetBlur();
      }, 300),
    []
  );

  // Setup event listeners once
  React.useEffect(() => {
    if (!setSelected) return;

    const body = $('body');
    const blurActions = $('#csk-blur-actions');

    // Add event listeners
    body
      .on('click', CSK_ENTRY_SELECTOR, handleCskEntryClick)
      .on('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
      .on('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave)
      .on('mouseover', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter);

    blurActions.on('mouseleave', handleActionsMouseleave);

    // Cleanup
    return () => {
      // Cancel all throttled functions
      handleCskEntryClick.cancel();
      handleCskEntryMouseenter.cancel();
      handleCskEntryMouseleave.cancel();
      handleActionsMouseleave.cancel();

      // Remove event listeners
      body
        .off('click', CSK_ENTRY_SELECTOR, handleCskEntryClick)
        .off('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
        .off('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave)
        .off('mouseover', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter);

      blurActions.off('mouseleave', handleActionsMouseleave);
    };
  }, [
    setSelected,
    handleCskEntryClick,
    handleCskEntryMouseenter,
    handleCskEntryMouseleave,
    handleActionsMouseleave
  ]);

  // Create stable throttled functions
  const throttledSetActive = React.useMemo(
    () =>
      throttle(newActive => {
        setActive(newActive);
      }, 300),
    []
  );

  const throttledSetSections = React.useMemo(
    () =>
      throttle(newSections => {
        setSections(newSections);
      }, 300),
    []
  );

  // Memoize sections mapping function
  const mapSections = React.useCallback((elSections, includeScroll = true) => {
    return Array.from(elSections).map(section => {
      const boundingRect = section.getBoundingClientRect();
      return {
        ...section,
        cskEntryId: section.getAttribute('data-csk-entry-id'),
        boundingRect,
        top: includeScroll ? window.scrollY + boundingRect.top : boundingRect.top,
        bottom: includeScroll ? window.scrollY + boundingRect.bottom : boundingRect.bottom
      };
    });
  }, []);

  // Handle resize
  const handleResize = React.useCallback(() => {
    const elSections = document.querySelectorAll('section');
    const mappedSections = mapSections(elSections, true);
    throttledSetSections(mappedSections);
  }, [mapSections, throttledSetSections]);

  // Handle mouse move
  const handleMouseMove = React.useCallback(
    evt => {
      const elSections = document.querySelectorAll('section');
      const mappedSections = mapSections(elSections, false);

      let newActive;
      for (let i = 0; i < mappedSections.length; i += 1) {
        const section = mappedSections[i];
        if (evt.clientY >= section.top && evt.clientY <= section.bottom) {
          newActive = i;
          break;
        }
      }

      if (newActive !== active) {
        throttledSetActive(newActive);
      }
    },
    [mapSections, active, throttledSetActive]
  );

  // Setup resize listener
  React.useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      throttledSetSections.cancel();
    };
  }, [handleResize, throttledSetSections]);

  // Setup mouse move listener
  React.useEffect(() => {
    const throttledMouseMove = throttle(handleMouseMove, 300);
    window.addEventListener('mousemove', throttledMouseMove);
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      throttledMouseMove.cancel();
      throttledSetActive.cancel();
    };
  }, [handleMouseMove, throttledSetActive]);

  // Initial page ID setup
  React.useLayoutEffect(() => {
    const pageParams = new URLSearchParams(window.location.search);
    setPageId(pageParams.get('id'));
  }, []);

  const handleOpen = React.useCallback(
    e => {
      e.preventDefault();
      const $selectedEl = $(CSK_ENTRY_SELECTOR).filter((_, el) => {
        const uuid = $(el).data(CSK_ENTRY_UUID_NAME);
        return uuid === selectedPath[selectedPath.length - 1]?.uuid;
      });

      const entryId = $selectedEl.data(CSK_ENTRY_ID_NAME);
      if (!entryId) return;

      const url = getContentfulItemUrl(entryId, selectedPath);
      if (window.self !== window.top) {
        window.parent.postMessage(
          {
            type: 'NAVIGATE_TO',
            payload: { url }
          },
          '*'
        );
        window.open(url);
      } else {
        window.open(url);
      }
    },
    [selectedPath]
  );

  const handleBugReport = React.useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();

      // Try to find the currently blurred element
      const $blurredElement = $('.csk-entry-unblur');

      // If no blurred element, try to use the selected path
      let $targetElement = $blurredElement.length ? $blurredElement : null;
      if (!$targetElement?.length) {
        const selectedUuid = selectedPath[selectedPath.length - 1]?.uuid;
        if (selectedUuid) {
          $targetElement = $(`[data-${CSK_ENTRY_UUID_NAME}="${selectedUuid}"]`);
        }
      }

      if (!$targetElement?.length) {
        // If still no element found, try to find any element under the blur actions
        const $blurActions = $('#csk-blur-actions');
        const blurRect = $blurActions[0]?.getBoundingClientRect();
        if (blurRect) {
          // Try points around the blur actions to find the element
          const points = [
            [blurRect.left - 10, blurRect.top],
            [blurRect.left, blurRect.top - 10],
            [blurRect.right + 10, blurRect.top],
            [blurRect.left, blurRect.bottom + 10]
          ];

          for (const [x, y] of points) {
            const el = document.elementFromPoint(x, y);
            if (el) {
              $targetElement = $(el).closest(CSK_ENTRY_SELECTOR);
              if ($targetElement.length) break;
            }
          }
        }
      }

      if (!$targetElement?.length) {
        console.warn('No element found for bug report');
        return;
      }

      const selectedElement = $targetElement[0];
      const elementInfo = {
        path: selectedPath,
        uuid: selectedElement.getAttribute(`data-${CSK_ENTRY_UUID_NAME}`),
        type: selectedElement.getAttribute('data-csk-entry-type'),
        id: selectedElement.getAttribute('data-csk-entry-id')
      };

      setSelectedBugElement(selectedElement);
      setSelectedBugInfo(elementInfo);
    },
    [selectedPath]
  );

  const handleCloseBugReport = React.useCallback(() => {
    setSelectedBugElement(null);
    setSelectedBugInfo(null);
  }, []);

  return (
    <>
      {['top', 'bottom', 'left', 'right'].map(dir => (
        <div
          id={`csk-blur-${dir}`}
          key={dir}
          className={`csk-blur csk-blur-${dir}`}
          onClick={() => {
            resetSelectedOutline();
            setSelected(null);
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
          key={section.cskEntryId || `section-${index}`}
          active={index === active ? 1 : 0}
          section={section}
          index={index}
          setAddToTemplate={setAddToTemplate}
          pageId={pageId}
        />
      ))}
      <div id="csk-blur-actions">
        <IconButton
          sx={{
            'color': 'black',
            'backgroundColor': 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
          onClick={handleOpen}>
          <Tooltip title="Edit Content">
            <IconEdit />
          </Tooltip>
        </IconButton>
        <IconButton
          sx={{
            'color': 'red',
            'backgroundColor': 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
          onClick={e => handleBugReport(e)}>
          <Tooltip title="Report Bug">
            <BugReportIcon />
          </Tooltip>
        </IconButton>
      </div>

      <BugReporter
        selectedElement={selectedBugElement}
        elementInfo={selectedBugInfo}
        onClose={handleCloseBugReport}
      />
    </>
  );
}

function SectionUI({ pageId, section, setAddToTemplate, index, active }) {
  // const [active, setActive] = React.useState(false);
  const { reorderContent, removeContentFromIndex } = useContentfulContext();
  const handleDelete = async () => {
    try {
      await removeContentFromIndex({ pageId, index, field: 'contents' });
    } catch (err) {
      // console.log('Delete error', err);
    }
  };

  const handleOpen = () => {
    // console.log('HandleOpen', { self: window.self, top: window.top });
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
      active={active ? 1 : 0}
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
            <ToggleButton value="Edit" sx={{ width: 40, height: 40 }} onClick={handleOpen}>
              <Tooltip title="Edit">
                <IconEdit />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="Delete" sx={{ width: 40, height: 40 }} onClick={handleDelete}>
              <Tooltip title="Delete">
                <IconDelete sx={{ color: 'danger.main' }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="MoveUp"
              sx={{ width: 40, height: 40 }}
              onClick={() => reorderContent({ pageId, from: index, to: index - 1 })}>
              <Tooltip title="MoveUp">
                <IconMoveUp />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value="MoveDown"
              sx={{ width: 40, height: 40 }}
              onClick={() => reorderContent({ pageId, from: index, to: index + 1 })}>
              <Tooltip title="MoveDown">
                <IconMoveDown />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </SectionInner>
    </SectionUIContainer>
  );
}
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
