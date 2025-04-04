export const setSelectedOutline = (target, editUrl) => {
  let el = target;
  if (!el.getAttribute('data-csk-entry-id')) {
    const parentEl = target.closest('[data-csk-entry-id]');
    el = parentEl;
  }
  const docHeight = document.documentElement.scrollHeight;
  const docWidth = window.innerWidth;
  const ctHeight = el.offsetHeight;
  const ctWidth = el.offsetWidth;

  const posTop = parseInt(el.getBoundingClientRect().top + window.scrollY, 10);
  const posBottom = docHeight - (posTop + ctHeight);
  const posLeft = parseInt(el.getBoundingClientRect().left + window.scrollX, 10);
  const posRight = docWidth - posLeft - ctWidth;
  document.querySelectorAll('.csk-selected').forEach(selected => {
    const element = selected;
    element.style.opacity = 1;
  });
  const leftElement = document.getElementById('csk-selected-left');
  leftElement.style.width = `${posLeft}px`;
  leftElement.style.height = `${docHeight}px`;
  const rightElement = document.getElementById('csk-selected-right');
  rightElement.style.width = `${posRight}px`;
  rightElement.style.height = `${docHeight}px`;
  document.getElementById('csk-selected-top').style.height = `${posTop}px`;
  document.getElementById('csk-selected-bottom').style.height = `${posBottom}px`;

  if (editUrl) {
    const actions = document.getElementById('csk-selected-actions');
    actions.classList.remove('hidden');
    actions.style.top = `${posTop}px`;
    actions.style.left = `${posLeft}px`;
    document.getElementById('csk-edit-link').setAttribute('href', editUrl);
  }
};

export const resetSelectedOutline = () => {
  document.getElementById('csk-selected-top').style.height = '0';
  document.getElementById('csk-selected-bottom').style.height = '0';
  document.getElementById('csk-selected-left').style.width = '0';
  document.getElementById('csk-selected-right').style.width = '0';
  const actions = document.getElementById('csk-selected-actions');
  actions.classList.add('hidden');
  actions.style.left = '0';
  actions.style.top = '0';
  actions.setAttribute('href', '#');
  document.querySelectorAll('.csk-selected').forEach(selected => {
    const element = selected;
    element.style.opacity = 0;
  });
};
