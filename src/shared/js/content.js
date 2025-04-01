import React from 'react';
import { createRoot } from 'react-dom/client';
import getIsSideKickEnabledFromStorage from './helpers/getIsSideKickEnabledFromStorage';
import Sidekick from './components/Sidekick/Sidekick';
import addSidekickEnabledListener from './helpers/addSidekickEnabledListener';
import buildCskEntryTree from './helpers/buildCskEntryTree';
import { CSK_ENTRY_SELECTOR } from './helpers/constants';

const shrinkContent = () => {
  // $('body').css('padding-left', '20vw');
  // $('*').filter(function () {
  //   const $el = $(this);
  //   if ($el.css('position') == 'fixed') {
  //     const padding = $el.css('padding-left');
  //     $el.data('padding-left', padding);
  //     $el.css('padding-left', `calc(20vw + ${padding})`);
  //   }
  // });
};

const expandContent = () => {
  // $('*').filter(function () {
  //   const $el = $(this);
  //   if ($el.css('position') == 'fixed') {
  //     const padding = $el.data('padding-left');
  //     $el.css('padding-left', padding);
  //   }
  // });
  $('body').css('padding-left', 0);
};

const loadSidebar = () => {
  $('body').prepend('<div id="csk-sidebar-container"></div>');
  shrinkContent();
  const root = createRoot(document.getElementById('csk-sidebar-container'));
  root.render(<Sidekick defaultTree={buildCskEntryTree()} />);
};

const removeSidebar = () => {
  $('#csk-sidebar-container').remove();
  expandContent();
};

const addInitAttribute = () => {
  $('body').attr('data-init-csk', true);
};

const removeInitAttribute = () => {
  $('body').removeAttr('data-init-csk');
};

const applyBgColorVar = () => {
  $(CSK_ENTRY_SELECTOR).each((_index, el) => {
    let inheritedBgColor;

    $(el)
      .filter(() => {
        const bgImageUrl = $(el).css('background-image');
        const bgColor = $(el).css('background-color');
        if (
          bgImageUrl !== 'none' ||
          bgColor.indexOf('rgba') === -1 ||
          bgColor.replace(/^.*,(.+)\)/, '$1').trim() !== '0'
        ) {
          $(el).attr('data-csk-init-bg', true);
          return false;
        }

        return true;
      })
      .parents()
      .each((i, v) => {
        const $el = $(v);
        const bgImageUrl = $el.css('background-image');
        if (bgImageUrl !== 'none') {
          inheritedBgColor = false;
          return false;
        }

        const bgColor = $el.css('background-color');

        if (bgColor.indexOf('rgba') > -1) {
          if (bgColor.replace(/^.*,(.+)\)/, '$1').trim() !== '0') {
            inheritedBgColor = bgColor;
            return false;
          }
        } else {
          inheritedBgColor = bgColor;
          return false;
        }
        return true;
      })
      .end()
      .attr('style', () => {
        const curStyleAttr = $(el).attr('style') || '';
        const curBgColor = inheritedBgColor || 'inherit';
        if (curStyleAttr.indexOf('--bgColor') === -1) {
          return `${curStyleAttr} --bgColor:${curBgColor};`;
        }
        return curStyleAttr;
      });
  });
};

const removeBgColorVar = () => {
  $(CSK_ENTRY_SELECTOR).css('--bgColor', '');
};

export const resetDom = () => {
  removeInitAttribute();
  removeSidebar();
  removeBgColorVar();
};

export const loadSidekick = async () => {
  addInitAttribute();
  loadSidebar();
  applyBgColorVar();
};

const init = async () => {
  const isSidekickEnabled = await getIsSideKickEnabledFromStorage();
  if (!isSidekickEnabled) {
    return;
  }

  // Add sidekick enabled listener
  addSidekickEnabledListener();

  // Add sidekick container
  const sidekickContainer = document.createElement('div');
  sidekickContainer.setAttribute('id', 'csk-sidekick');
  document.body.appendChild(sidekickContainer);

  // Add sidekick overlay
  const overlayContainer = document.createElement('div');
  overlayContainer.setAttribute('id', 'csk-overlay');
  document.body.appendChild(overlayContainer);

  // Add blur containers
  ['top', 'bottom', 'left', 'right'].forEach(dir => {
    const blurContainer = document.createElement('div');
    blurContainer.setAttribute('id', `csk-blur-${dir}`);
    blurContainer.setAttribute('class', 'csk-blur');
    document.body.appendChild(blurContainer);
  });

  // Add blur actions container
  const blurActionsContainer = document.createElement('div');
  blurActionsContainer.setAttribute('id', 'csk-blur-actions');
  blurActionsContainer.setAttribute('class', 'hidden');
  blurActionsContainer.innerHTML = '<a id="csk-edit-link" target="_blank" href="#">Edit</a>';
  document.body.appendChild(blurActionsContainer);

  // Add selected containers
  ['top', 'bottom', 'left', 'right'].forEach(dir => {
    const selectedContainer = document.createElement('div');
    selectedContainer.setAttribute('id', `csk-selected-${dir}`);
    selectedContainer.setAttribute('class', 'csk-selected');
    document.body.appendChild(selectedContainer);
  });

  // Add selected actions container
  const selectedActionsContainer = document.createElement('div');
  selectedActionsContainer.setAttribute('id', 'csk-selected-actions');
  selectedActionsContainer.setAttribute('class', 'hidden');
  document.body.appendChild(selectedActionsContainer);

  // Initialize sidekick
  document.body.setAttribute('data-init-csk', true);

  // Build tree
  const tree = buildCskEntryTree();

  // Render React app
  const root = createRoot(sidekickContainer);
  root.render(<Sidekick defaultTree={tree} />);

  // Add body padding
  const sidebarWidth = $('.csk-element-sidebar').outerWidth(true);
  if (sidebarWidth) {
    $('body').css('padding-left', sidebarWidth);
  }

  // Add click handler for overlay
  $('#csk-overlay').on('click', () => {
    $('#csk-overlay').removeClass('show');
  });

  // Add click handler for edit link
  $('#csk-edit-link').on('click', e => {
    e.preventDefault();
    const href = $(e.target).attr('href');
    if (href === '#') return;

    if (window.self !== window.top) {
      window.parent.postMessage(
        {
          type: 'NAVIGATE_TO',
          payload: {
            url: href
          }
        },
        '*'
      );
    } else {
      window.open(href);
    }
  });

  // Listen for messages from parent frame
  window.addEventListener('message', event => {
    if (event.data.type === 'CONTENTFUL_SIDEKICK_ENABLED') {
      chrome.storage.local.set({ sidekickEnabled: event.data.payload.enabled });
    }
  });

  // Send ready message to parent frame
  if (window.self !== window.top) {
    window.parent.postMessage(
      {
        type: 'CONTENTFUL_SIDEKICK_READY'
      },
      '*'
    );
  }
};

// Initialize on load
$(document).ready(() => {
  init();
});

// Listen for chrome storage changes
chrome.storage.onChanged.addListener(changes => {
  if (changes.sidekickEnabled) {
    window.location.reload();
  }
});
