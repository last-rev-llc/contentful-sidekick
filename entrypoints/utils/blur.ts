export const setBlur = (target: HTMLElement, editUrl: string | null): void => {
  let el = target;
  if (!el.getAttribute("data-csk-entry-id")) {
    const parentEl = target.closest("[data-csk-entry-id]") as HTMLElement;
    if (parentEl) {
      el = parentEl;
    }
  }

  const docHeight = document.documentElement.scrollHeight;
  const docWidth = window.innerWidth;
  const ctHeight = el.offsetHeight;
  const ctWidth = el.offsetWidth;
  const ctType = el.getAttribute("data-csk-entry-type");
  const posTop = parseInt(
    String(el.getBoundingClientRect().top + window.scrollY),
    10
  );
  const posBottom = docHeight - (posTop + ctHeight);
  const posLeft = parseInt(
    String(el.getBoundingClientRect().left + window.scrollX),
    10
  );
  const posRight = docWidth - posLeft - ctWidth;

  // Add unblur class to target element
  el.classList.add("csk-entry-unblur");

  // First make sure all blur elements are visible but at 0 size
  document.querySelectorAll(".csk-blur").forEach((blur) => {
    const element = blur as HTMLElement;
    element.style.display = "block";
    element.style.opacity = "0";
  });

  // Force a reflow to ensure the initial state is rendered
  void document.body.offsetHeight;

  // Now set the final dimensions and fade in
  const blurLeft = document.getElementById("csk-blur-left");
  const blurRight = document.getElementById("csk-blur-right");
  const blurTop = document.getElementById("csk-blur-top");
  const blurBottom = document.getElementById("csk-blur-bottom");

  // Use requestAnimationFrame to ensure styles are applied in the next frame
  requestAnimationFrame(() => {
    document.querySelectorAll(".csk-blur").forEach((blur) => {
      const element = blur as HTMLElement;
      element.style.opacity = "1";
    });

    if (blurLeft) {
      blurLeft.style.width = `${posLeft}px`;
      blurLeft.style.height = `${docHeight}px`;
    }
    if (blurRight) {
      blurRight.style.width = `${posRight}px`;
      blurRight.style.height = `${docHeight}px`;
    }
    if (blurTop) {
      blurTop.style.height = `${posTop}px`;
      blurTop.style.maxHeight = `${posTop}px`;
    }
    if (blurBottom) {
      blurBottom.style.height = `${posBottom}px`;
    }
  });

  if (editUrl) {
    const actions = document.getElementById("csk-blur-actions");
    if (actions) {
      actions.classList.remove("hidden");
      actions.style.top = `${posTop}px`;
      actions.style.left = `${posLeft}px`;
    }
  }
};

export const resetBlur = (): void => {
  // Remove unblur class from any elements that have it
  document.querySelectorAll(".csk-entry-unblur").forEach((el) => {
    el.classList.remove("csk-entry-unblur");
  });

  const blurTop = document.getElementById("csk-blur-top");
  const blurBottom = document.getElementById("csk-blur-bottom");
  const blurLeft = document.getElementById("csk-blur-left");
  const blurRight = document.getElementById("csk-blur-right");
  const actions = document.getElementById("csk-blur-actions");

  if (blurTop) blurTop.style.height = "0";
  if (blurBottom) blurBottom.style.height = "0";
  if (blurLeft) blurLeft.style.width = "0";
  if (blurRight) blurRight.style.width = "0";

  if (actions) {
    actions.classList.add("hidden");
    actions.style.left = "0";
    actions.style.top = "0";
  }

  document.querySelectorAll(".csk-blur").forEach((blur) => {
    const element = blur as HTMLElement;
    element.style.opacity = "0";
    element.style.display = "none";
  });
};

export const createBlurElements = (): void => {
  document.body.setAttribute("data-init-csk", "");

  // Create blur elements if they don't exist
  ["top", "bottom", "left", "right"].forEach((dir) => {
    const id = `csk-blur-${dir}`;
    if (!document.getElementById(id)) {
      const element = document.createElement("div");
      element.id = id;
      element.className = `csk-blur csk-blur-${dir}`;
      document.body.appendChild(element);
    }
  });

  // Create actions container if it doesn't exist
  if (!document.getElementById("csk-blur-actions")) {
    const actions = document.createElement("div");
    actions.id = "csk-blur-actions";
    actions.className = "hidden";
    document.body.appendChild(actions);
  }
};
