/* global chrome */

const setupDom = () => {
  $('body').attr('data-init-csk', true);
  if (!$('#csk-overlay').length) {
    $('body').append($('<div>').attr('id', 'csk-overlay'));
  }
};

const resetDom = () => {
  $('body').removeAttr('data-init-csk');
  $('#csk-overlay').remove();
};

const getState = new Promise((resolve, reject) => {
  chrome.storage.sync.get({
    sideKickEnabled: false,
  }, (items) => {
    resolve(items.sideKickEnabled);
  });
});


const init = () => {
  const CONTENTFUL_CURRENT_SPACE_ID = $('[name="contentful_space"]').attr('content');
  const CONTENTFUL_ENVIRONMENT = $('[name="contentful_environment"]').attr('content');
  const getContentfulUrl = elementId => `https://app.contentful.com/spaces/${CONTENTFUL_CURRENT_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${elementId}`;

  const $els = $('[data-csk-entry-id]');
  if ($els.length && CONTENTFUL_CURRENT_SPACE_ID && CONTENTFUL_ENVIRONMENT) {
    $.each($els, (index, el) => {
      const elementId = $(el).data('csk-entry-id');

      let inheritedBgColor;
      $(el)
        .off('click')
        .on('click', (e) => {
          if ($(e.target).data('csk-entry-id') !== elementId) return;
          e.stopPropagation();
          window.open(getContentfulUrl(elementId));
        })
        .filter(() => {
          const bgImageUrl = $(el).css('background-image');
          const bgColor = $(el).css('background-color');
          if (bgImageUrl !== 'none' || bgColor.indexOf('rgba') === -1 || bgColor.replace(/^.*,(.+)\)/, '$1').trim() !== '0') {
            $(el).attr('data-csk-init-bg', true);
            return false;
          }

          return true;
        })
        .parents()
        .each((i, v) => {
          const bgImageUrl = $(v).css('background-image');
          if (bgImageUrl !== 'none') {
            inheritedBgColor = false;
            return false;
          }

          const bgColor = $(v).css('background-color');

          if (bgColor.indexOf('rgba') > -1) {
            if (bgColor.replace(/^.*,(.+)\)/, '$1').trim() !== '0') {
              inheritedBgColor = bgColor;
              return false;
            }
          } else {
            inheritedBgColor = bgColor;
            return false;
          }
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
  }

  $('[data-csk-entry-id]')
    .on('mouseenter', () => { $('#csk-overlay').addClass('show'); })
    .on('mouseleave', () => { $('#csk-overlay').removeClass('show'); });

  getState.then((active) => {
    if (active && $els && $els.length) {
      setupDom();
    } else {
      resetDom();
    }
  });
};

$(() => {
  setTimeout(init, 2000);
});

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.message === 'enable') {
      init();
    } else if (request.message === 'disable') {
      resetDom();
    }
  },
);
