import { ChatbotConfig } from "../types";
import { impossible } from "./impossible";
import { defaultConfig } from "./default";
import { webSummary } from "./webSummary";
import { webHtmlSummary } from "./webHtmlSummary";
import { contentfulAgent } from "./contentfulAgent";
import { webSearch } from "./webSearch";

// Define the configs as a Map to maintain insertion order
export const CHATBOT_CONFIGS = new Map<string, ChatbotConfig>([
  ["impossible", impossible],
  ["default", defaultConfig],
  ["webSummary", webSummary],
  ["webHtmlSummary", webHtmlSummary],
  ["contentfulAgent", contentfulAgent],
  ["webSearch", webSearch],
]);
