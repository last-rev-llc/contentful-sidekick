import { browser } from "wxt/browser";
import type { ContentScriptContext } from "#imports";
import { navigateToPanel } from "./navigateToPanel";
import { setBlur, resetBlur, createBlurElements } from "./blur";
import { sendMessage } from "./messaging";

let currentHighlightedElement: HTMLElement | null = null;
let observer: MutationObserver | null = null;

const getMetaTagValue = (name: string): string | null => {
  const metaTag = document.querySelector(`meta[name="${name}"]`);
  return metaTag?.getAttribute("content") || null;
};

// Create actions container with buttons
const createActionsContainer = () => {
  const container = document.getElementById("csk-blur-actions");
  if (!container) return;

  // Add edit button
  const editButton = document.createElement("button");
  editButton.className = "csk-icon-button";
  editButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  `;
  editButton.title = "Edit in Contentful";
  editButton.onclick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentHighlightedElement) {
      const entryId =
        currentHighlightedElement.getAttribute("data-csk-entry-id");
      if (entryId) {
        const spaceId = await getMetaTagValue("contentful_space");
        const env = await getMetaTagValue("contentful_environment");
        if (spaceId && env) {
          window.open(
            `https://app.contentful.com/spaces/${spaceId}/environments/${env}/entries/${entryId}`,
            "_blank"
          );
        }
      }
    }
  };
  container.appendChild(editButton);

  // Add bug report button
  const bugButton = document.createElement("button");
  bugButton.className = "csk-icon-button";
  bugButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
      <circle cx="12" cy="12" r="7"></circle>
      <path d="M12 9v2M12 15h.01"></path>
    </svg>
  `;
  bugButton.title = "Report Issue";
  bugButton.onclick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentHighlightedElement) {
      const entryId =
        currentHighlightedElement.getAttribute("data-csk-entry-id");
      const entryType = currentHighlightedElement.getAttribute(
        "data-csk-entry-type"
      );
      const entryField = currentHighlightedElement.getAttribute(
        "data-csk-entry-field"
      );

      if (entryId) {
        const field = entryField?.trim() || null;
        const type = entryType?.trim() || null;

        let message = `Please submit a bug report for this element.\n\n`;
        message += `URL: ${window.location.href}\n`;
        message += `Content ID: ${entryId}\n`;

        if (field) {
          message += `Field: ${field}\n`;
        }

        if (type) {
          message += `Type: ${type}`;
        }

        try {
          // First open the chatbot panel
          await navigateToPanel("chatbot");

          // Then send the message to the chatbot
          await sendMessage("sendToChatbot", message);
        } catch (error) {
          console.error("Failed to send messages:", error);
        }
      }
    }
  };
  container.appendChild(bugButton);
};

const handleElementHighlight = async (element: HTMLElement) => {
  try {
    // Get the entry ID
    const entryId = element.getAttribute("data-csk-entry-id");
    if (!entryId) return;

    const spaceId = await getMetaTagValue("contentful_space");
    const env = await getMetaTagValue("contentful_environment");

    if (!spaceId || !env) return;

    // Create the Contentful URL
    const url = `https://app.contentful.com/spaces/${spaceId}/environments/${env}/entries/${entryId}`;

    // Update the current highlighted element
    currentHighlightedElement = element;

    // Set the blur effect
    setBlur(element, url);
  } catch (error) {
    console.error("Error handling element highlight:", error);
    resetBlur();
  }
};

export const initializeContentfulHighlighting = async (
  ctx: ContentScriptContext
) => {
  try {
    const spaceId = await getMetaTagValue("contentful_space");
    const env = await getMetaTagValue("contentful_environment");
    console.log("initializeContentfulHighlighting", spaceId, env);

    if (spaceId && env) {
      // Create blur elements if they don't exist
      createBlurElements();
      createActionsContainer();

      // Add hover listeners
      addContentfulHoverListeners(ctx);
    }
  } catch (error) {
    console.error("Failed to initialize Contentful highlighting:", error);
  }
};

export const addContentfulHoverListeners = (ctx: ContentScriptContext) => {
  // Use ctx.addEventListener for automatic cleanup
  ctx.addEventListener(document.body, "mouseover", (e: Event) => {
    const target = e.target as HTMLElement;
    const contentfulElement = target.closest(
      "[data-csk-entry-id]"
    ) as HTMLElement;

    if (contentfulElement && contentfulElement !== currentHighlightedElement) {
      handleElementHighlight(contentfulElement);
    }
  });

  ctx.addEventListener(document.body, "mouseout", (e: Event) => {
    const target = e.target as HTMLElement;
    const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;

    // Check if we're moving to a blur element or actions
    const isMovingToBlurElement = relatedTarget?.closest(
      ".csk-blur, #csk-blur-actions"
    );

    if (!isMovingToBlurElement) {
      resetBlur();
      currentHighlightedElement = null;
    }
  });
};

export const handleSelectedPath = (uuids: string[]) => {
  if (uuids.length > 0) {
    const lastUuid = uuids[uuids.length - 1];
    const element = document.querySelector(
      `[data-csk-entry-uuid="${lastUuid}"]`
    ) as HTMLElement;
    if (element) {
      handleElementHighlight(element);
    }
  } else {
    resetBlur();
    currentHighlightedElement = null;
  }
};

export const cleanup = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  resetBlur();
  // Remove container on cleanup
  const container = document.getElementById("csk-container");
  if (container) {
    container.remove();
  }
};
