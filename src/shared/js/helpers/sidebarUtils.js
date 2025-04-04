import { CSK_ENTRY_SELECTOR } from './constants';

export const loadSidebar = () => {
  // Only load if not already initialized
  if (!document.getElementById('csk-sidekick')) {
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

    document.body.setAttribute('data-init-csk', true);
  }
};

export const removeSidebar = () => {
  // Remove all sidekick-related elements
  $('#csk-sidekick').remove();
  $('#csk-overlay').remove();
  $('.csk-blur').remove();
  $('#csk-blur-actions').remove();
  $('.csk-selected').remove();
  $('#csk-selected-actions').remove();
  document.body.removeAttribute('data-init-csk');
};

export const applyBgColorVar = () => {
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

export const removeBgColorVar = () => {
  $(CSK_ENTRY_SELECTOR).css('--bgColor', '');
};

export const resetDom = () => {
  document.body.removeAttribute('data-init-csk');
  removeSidebar();
  removeBgColorVar();
};
