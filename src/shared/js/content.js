import React from 'react';
import ReactDOM from 'react-dom';
import getIsSideKickEnabledFromStorage from './helpers/getIsSideKickEnabledFromStorage';
import hasContentfulVars from './helpers/hasContentfulVars';
import Sidekick from './components/Sidekick';
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
  ReactDOM.render(<Sidekick defaultTree={buildCskEntryTree()} />, document.getElementById('csk-sidebar-container'));
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

const resetDom = () => {
  removeInitAttribute();
  removeSidebar();
  removeBgColorVar();
};

const loadSidekick = async () => {
  addInitAttribute();
  loadSidebar();
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
        // resetDom();
        // loadSidekick();
      }
    });
  });
};

$(() => {
  setTimeout(init, 2000);
});
