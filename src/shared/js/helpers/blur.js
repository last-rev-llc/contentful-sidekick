export const setBlur = ($el) => {
  const docHeight = $(document).height();
  const docWidth = $(document).width();
  const bodyHeight = $('body').height();
  const ctHeight = $el.outerHeight(true);
  const ctWidth = $el.outerWidth(true);

  const posTop = parseInt($el.offset().top, 10);
  const posBottom = docHeight - (posTop + ctHeight);
  const posLeft = parseInt($el.offset().left - $(document).scrollLeft(), 10);
  const posRight = docWidth - posLeft - ctWidth;

  $('#csk-blur-left').css({ width: posLeft, height: docHeight });
  $('#csk-blur-right').css({ width: posRight, height: docHeight });
  $('#csk-blur-top').css('height', posTop);
  $('#csk-blur-bottom').css({ bottom: bodyHeight - docHeight, height: posBottom });
};

export const resetBlur = () => {
  $('#csk-blur-top').css('height', 0);
  $('#csk-blur-bottom').css('height', 0);
  $('#csk-blur-left').css('width', 0);
  $('#csk-blur-right').css('width', 0);
};
