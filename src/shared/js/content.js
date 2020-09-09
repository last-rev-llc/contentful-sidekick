import 'regenerator-runtime/runtime';
import React from 'react';
// import { createClient } from 'contentful';
import ReactDOM from 'react-dom';
import getIsSideKickEnabledFromStorage from './helpers/getIsSideKickEnabledFromStorage';
import hasContentfulVars from './helpers/hasContentfulVars';
import Sidebar from './components/Sidebar';
import addSidekickEnabledListener from './helpers/addSidekickEnabledListener';
import buildCskEntryTree from './helpers/buildCskEntryTree';
import { CSK_ENTRY_UUID_NAME } from './helpers/constants';
// import getContentfulVars from './helpers/getContentfulVars';

const handleCskEntryIdHoverOn = () => {
  $('#csk-overlay').addClass('show');
};

const handleCskEntryIdHoverOff = () => {
  $('#csk-overlay').removeClass('show');
};

const loadSidebar = () => {
  // const CONTENTFUL_ACCESSTOKEN = 'jt-D9xc88GjIGA9EJniknD2N20rqkVknbgFrZ2YIEfU';
  // const CONTENTFUL_HOST = 'preview.contentful.com'; // TODO: do we always use preview, or add a field to the popup for it?

  // const [space, environment] = getContentfulVars();
  // // TODO: some of these vars to be replaced with oauth
  // const client = createClient({
  //   space,
  //   environment,
  //   accessToken: CONTENTFUL_ACCESSTOKEN,
  //   host: CONTENTFUL_HOST || 'preview.contentful.com'
  // });

  $('body').prepend('<div id="csk-sidebar-container"></div>');

  ReactDOM.render(<Sidebar tree={buildCskEntryTree()} />, document.getElementById('csk-sidebar-container'));
};

const removeSidebar = () => {
  $('#csk-sidebar-container').remove();
  // $('#csk-site-content').detach().children().appendTo('body');
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

const addIdHoverHandlers = () => {
  $('[data-csk-uuid]').hover(handleCskEntryIdHoverOn, handleCskEntryIdHoverOff);
};

const removeIdHoverHandlers = () => {
  $('[data-csk-uuid]').unbind('hover');
};

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
  removeIdHoverHandlers();
  removeBgColorVar();
};

const loadSidekick = async () => {
  addInitAttribute();
  loadSidebar();
  addOverlay();
  addIdHoverHandlers();
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
};

$(() => {
  setTimeout(init, 2000);
});
