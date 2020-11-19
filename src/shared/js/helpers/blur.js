export const setBlur = ($el, editUrl) => {
  const docHeight = $(document).height();
  const docWidth = $(window).width();
  const bodyHeight = $('body').height();
  const ctHeight = $el.outerHeight(true);
  const ctWidth = $el.outerWidth(true);

  const posTop = parseInt($el.offset().top, 10);
  const posBottom = docHeight - (posTop + ctHeight);
  const posLeft = parseInt($el.offset().left - $(document).scrollLeft(), 10);
  const posRight = docWidth - posLeft - ctWidth;
  $('.csk-blur').css('opacity', 1);
  $('#csk-blur-left').css({ width: posLeft, height: docHeight });
  $('#csk-blur-right').css({ width: posRight, height: docHeight });
  $('#csk-blur-top').css('height', posTop);
  $('#csk-blur-bottom').css({ bottom: bodyHeight - docHeight, height: posBottom });

  if (editUrl) {
    $('#csk-blur-actions').removeClass('hidden').css({ top: posTop, left: posLeft }).attr('href', editUrl);
  }
};

export const resetBlur = () => {
  $('#csk-blur-top').css('height', 0);
  $('#csk-blur-bottom').css('height', 0);
  $('#csk-blur-left').css('width', 0);
  $('#csk-blur-right').css('width', 0);
  $('#csk-blur-actions').addClass('hidden').css({ left: 0, top: 0 }).attr('href', '#');
  $('.csk-blur').css('opacity', 0);
};
