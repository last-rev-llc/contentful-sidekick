/* global chrome */
const clickEvent = (e) => {
  const CONTENTFUL_CURRENT_SPACE_ID = $('[name="contentful_space"]').attr('content');
  const CONTENTFUL_ENVIRONMENT = $('[name="contentful_environment"]').attr('content');
  // eslint-disable-next-line max-len
  const getContentfulUrl = elementId => `https://app.contentful.com/spaces/${CONTENTFUL_CURRENT_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${elementId}`;

  if (!$(e.target).attr('data-csk-entry-id')) return;
  window.open(getContentfulUrl($(e.target).attr('data-csk-entry-id')));
};

const resetDom = () => {
  $('body').removeAttr('data-init-csk');
  $('#csk-overlay').remove();
  $('body').off('click', '[data-csk-entry-id]', clickEvent);
};

const init = () => {
  $('[data-csk-entry-field]')
    .hover((e) => {
      const field = $(e.currentTarget).data('csk-entry-field');
      if (field !== undefined || field !== 'false') {
        $(e.currentTarget).append(`<div class="cs-item-name">${field}</div>`);
      }
    }, () => {
      $('[data-init-csk] .cs-item-name').remove();
    });

  const $els = $('[data-csk-entry-id]');
  const CONTENTFUL_CURRENT_SPACE_ID = $('[name="contentful_space"]').attr('content');
  const CONTENTFUL_ENVIRONMENT = $('[name="contentful_environment"]').attr('content');

  if ($els.length && CONTENTFUL_CURRENT_SPACE_ID && CONTENTFUL_ENVIRONMENT) {
    $('body').on('click', '[data-csk-entry-id]', clickEvent);

    $.each($els, (index, el) => {
      let inheritedBgColor;

      $(el).filter(() => {
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

  chrome.storage.sync.get({
    sideKickEnabled: false,
  }, (items) => {
    if (items.sideKickEnabled) {
      $('body').attr('data-init-csk', true);
      if (!$('#csk-overlay').length) {
        $('body').append($('<div>').attr('id', 'csk-overlay'));
      }
    }
  });
};

$(() => {
  setTimeout(init, 2000);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.sideKickEnabled) {
    if (changes.sideKickEnabled.newValue === true) {
      init();
    } else {
      resetDom();
    }
  }
});
