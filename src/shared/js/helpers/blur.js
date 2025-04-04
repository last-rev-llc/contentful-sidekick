export const setBlur = (target, editUrl) => {
  let el = target;
  if (!el.getAttribute('data-csk-entry-id')) {
    const parentEl = target.closest('[data-csk-entry-id]');
    el = parentEl;
  }
  const docHeight = document.documentElement.scrollHeight;
  const docWidth = window.innerWidth;
  const ctHeight = el.offsetHeight;
  const ctWidth = el.offsetWidth;
  const ctType = el.getAttribute('data-csk-entry-type');
  const posTop = parseInt(el.getBoundingClientRect().top + window.scrollY, 10);
  const posBottom = docHeight - (posTop + ctHeight);
  const posLeft = parseInt(el.getBoundingClientRect().left + window.scrollX, 10);
  const posRight = docWidth - posLeft - ctWidth;
  document.querySelectorAll('.csk-blur').forEach(blur => {
    const element = blur;
    element.style.opacity = 1;
    element.style.display = 'block';
  });
  document.getElementById('csk-blur-left').style.width = `${posLeft}px`;
  document.getElementById('csk-blur-left').style.height = `${docHeight}px`;
  document.getElementById('csk-blur-right').style.width = `${posRight}px`;
  document.getElementById('csk-blur-right').style.height = `${docHeight}px`;
  document.getElementById('csk-blur-top').style.height = `${posTop}px`;
  document.getElementById('csk-blur-bottom').style.height = `${posBottom}px`;

  if (editUrl) {
    const actions = document.getElementById('csk-blur-actions');
    actions.classList.remove('hidden');
    actions.style.top = `${posTop}px`;
    actions.style.left = `${posLeft}px`;
    const editLink = document.getElementById('csk-edit-link');
    editLink.setAttribute('href', editUrl);
    editLink.textContent = `Edit ${ctType}`;
  }
};

export const resetBlur = () => {
  document.getElementById('csk-blur-top').style.height = '0';
  document.getElementById('csk-blur-bottom').style.height = '0';
  document.getElementById('csk-blur-left').style.width = '0';
  document.getElementById('csk-blur-right').style.width = '0';
  const actions = document.getElementById('csk-blur-actions');
  actions.classList.add('hidden');
  actions.style.left = '0';
  actions.style.top = '0';
  actions.setAttribute('href', '#');
  document.querySelectorAll('.csk-blur').forEach(blur => {
    const element = blur;
    element.style.opacity = 0;
    element.style.display = 'none';
  });
};
