export async function sendToChatbot(message: string): Promise<void> {
  try {
    const chatbotElement = document.querySelector("aai-fullchatbot");
    if (!chatbotElement) {
      throw new Error("<aai-fullchatbot> element not found");
    }

    if (typeof (chatbotElement as any).sendMessage === "function") {
      (chatbotElement as any).sendMessage(message);
      focusInput(chatbotElement);
    } else {
      const shadowRoot = (chatbotElement as any).shadowRoot;
      if (!shadowRoot) {
        throw new Error("Shadow DOM not found for the chatbot element");
      }

      const inputElement =
        (shadowRoot.querySelector('input[type="text"]') as HTMLInputElement) ||
        (shadowRoot.querySelector("textarea") as HTMLTextAreaElement);

      if (!inputElement) {
        throw new Error("Input element not found in the chatbot shadow DOM");
      }

      inputElement.value = message;
      inputElement.dispatchEvent(
        new Event("input", { bubbles: true, composed: true })
      );

      inputElement.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
          composed: true,
        })
      );
    }
  } catch (error) {
    console.error("Error sending message to chatbot:", error);
    throw new Error("Failed to send message to chatbot");
  }
}

function focusInput(chatbotElement: Element) {
  setTimeout(() => {
    const shadowRoot = (chatbotElement as any).shadowRoot;
    if (shadowRoot) {
      const inputElement = shadowRoot.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      if (inputElement) {
        focusInputAndMoveCursor(inputElement);
      }
    }
  }, 0);
}

function focusInputAndMoveCursor(inputElement: HTMLInputElement) {
  inputElement.focus();
  const length = inputElement.value.length;
  inputElement.setSelectionRange(length, length);
}
