export interface PageContent {
  html: string;
  text: string;
}

const removeClassesAndDataAttributes = (html: string): string => {
  const template = document.createElement("template");
  template.innerHTML = html;

  const removeAttributes = (element: Element) => {
    // Remove class attributes
    element.removeAttribute("class");

    // Remove all data-* attributes
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-")) {
        element.removeAttribute(attr.name);
      }
    });

    // Process child elements recursively
    Array.from(element.children).forEach(removeAttributes);
  };

  // Process all direct children of the document fragment
  Array.from(template.content.children).forEach(removeAttributes);
  return template.innerHTML;
};

export const getPageContent = (): PageContent => {
  console.log("[Content] Getting page content");

  const rawHtml = document.body.innerHTML;
  const cleanedHtml = removeClassesAndDataAttributes(rawHtml);

  const content = {
    html: cleanedHtml,
    text: document.body.innerText,
  };

  console.log("[Content] Page content length:", {
    htmlLength: content.html.length,
    textLength: content.text.length,
  });

  return content;
};
