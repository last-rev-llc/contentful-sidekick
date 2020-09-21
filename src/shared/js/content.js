import React from 'react';
import ReactDOM from 'react-dom';
import getIsSideKickEnabledFromStorage from './helpers/getIsSideKickEnabledFromStorage';
import hasContentfulVars from './helpers/hasContentfulVars';
import Sidebar from './components/Sidebar';
import addSidekickEnabledListener from './helpers/addSidekickEnabledListener';
import buildCskEntryTree from './helpers/buildCskEntryTree';
import { CSK_ENTRY_UUID_NAME } from './helpers/constants';
// import getContentfulVars from './helpers/getContentfulVars';

// const handleCskEntryIdHoverOn = () => {
//   $('#csk-overlay').addClass('show');
// };

// const handleCskEntryIdHoverOff = () => {
//   $('#csk-overlay').removeClass('show');
// };

const loadSidebar = () => {
  $('body').prepend('<div id="csk-sidebar-container"></div>');

  ReactDOM.render(<Sidebar tree={buildCskEntryTree()} />, document.getElementById('csk-sidebar-container'));
};

const removeSidebar = () => {
  $('#csk-sidebar-container').remove();
};

const addInitAttribute = () => {
  $('body').attr('data-init-csk', true);
};

const removeInitAttribute = () => {
  $('body').removeAttr('data-init-csk');
};

const addOverlay = () => {
  if (!$('#csk-overlay').length) {
    $('body').append($('<div>').attr('id', 'csk-overlay'));
  }
};

const removeOverlay = () => {
  $('#csk-overlay').remove();
};

// const addIdHoverHandlers = () => {
//   $(`[data-${CSK_ENTRY_UUID_NAME}]`).on('mouseover', handleCskEntryIdHoverOn).on('mouseout', handleCskEntryIdHoverOff);
// };

// const removeIdHoverHandlers = () => {
//   $(`[data-${CSK_ENTRY_UUID_NAME}]`).off('mouseover').off('mouseout');
// };

const applyBgColorVar = () => {
  $(`[data-${CSK_ENTRY_UUID_NAME}]`).each((_index, el) => {
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
  $(`[data-${CSK_ENTRY_UUID_NAME}]`).css('--bgColor', '');
};

const resetDom = () => {
  removeInitAttribute();
  removeSidebar();
  removeOverlay();
  // removeIdHoverHandlers();
  removeBgColorVar();
};

const loadSidekick = async () => {
  addInitAttribute();
  loadSidebar();
  addOverlay();
  // addIdHoverHandlers();
  applyBgColorVar();
};

const init = async () => {
  if (!hasContentfulVars()) return; // not an enabled page

  const sideKickEnabled = await getIsSideKickEnabledFromStorage(); // extension not enabled

  if (sideKickEnabled) {
    loadSidekick();
  } else {
    resetDom();
  }

  addSidekickEnabledListener((isEnabled) => {
    if (isEnabled) {
      loadSidekick();
    } else {
      resetDom();
    }
  });

  chrome.runtime.onMessage.addListener((request) => {
    const { changedUrl } = request;
    getIsSideKickEnabledFromStorage().then((enabled) => {
      if (changedUrl && enabled) {
        resetDom();
        loadSidekick();
      }
    });
  });
};

$(() => {
  setTimeout(init, 2000);
});
