export const setSelectedOutline = ($target, editUrl) => {
  let $el = $target;
  if (!$el.data('cskEntryId')) {
    const $parentEl = $target.parents('[data-csk-entry-id]');
    $el = $($parentEl[0]);
  }
  const docHeight = $(document).height();
  const docWidth = $(window).width();
  const bodyHeight = $('body').height();
  const ctHeight = $el.outerHeight(true);
  const ctWidth = $el.outerWidth(true);

  const posTop = parseInt($el.offset().top, 10);
  const posBottom = docHeight - (posTop + ctHeight);
  const posLeft = parseInt($el.offset().left - $(document).scrollLeft(), 10);
  const posRight = docWidth - posLeft - ctWidth;
  $('.csk-selected').css('opacity', 1);
  $('#csk-selected-left').css({ width: posLeft, height: docHeight });
  $('#csk-selected-right').css({ width: posRight, height: docHeight });
  $('#csk-selected-top').css('height', posTop);
  $('#csk-selected-bottom').css({ bottom: bodyHeight - docHeight, height: posBottom });

  if (editUrl) {
    $('#csk-selected-actions').removeClass('hidden').css({ top: posTop, left: posLeft });
    $('#csk-selected-actions #csk-edit-link').attr('href', editUrl);
  }
};

export const resetSelectedOutline = () => {
  $('#csk-selected-top').css('height', 0);
  $('#csk-selected-bottom').css('height', 0);
  $('#csk-selected-left').css('width', 0);
  $('#csk-selected-right').css('width', 0);
  $('#csk-selected-actions').addClass('hidden').css({ left: 0, top: 0 }).attr('href', '#');
  $('.csk-selected').css('opacity', 0);
};
