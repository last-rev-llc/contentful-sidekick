import { browser } from "wxt/browser";
import type { Instance as TinyColor } from "tinycolor2";
import tinycolor from "tinycolor2";

interface ColorCounts {
  [key: string]: number;
}

interface ColorCollection {
  background: ColorCounts;
  text: ColorCounts;
  border: ColorCounts;
  [key: string]: ColorCounts;
}

function generateThemeColors(baseColor: string) {
  const base = tinycolor(baseColor);
  const secondaryBase = base.spin(180); // Create complementary color

  return {
    // Primary colors
    "primary-main": base.toHexString(),
    "primary-light": base.clone().lighten(15).toHexString(),
    "primary-dark": base.clone().darken(15).toHexString(),
    "primary-contrast": base.isLight() ? "#000000" : "#ffffff",

    // Secondary colors
    "secondary-main": secondaryBase.toHexString(),
    "secondary-light": secondaryBase.clone().lighten(15).toHexString(),
    "secondary-dark": secondaryBase.clone().darken(15).toHexString(),
    "secondary-contrast": secondaryBase.isLight() ? "#000000" : "#ffffff",

    // Text colors
    "text-primary": base.isDark() ? "#ffffff" : "#000000",
    "text-secondary": base.isDark()
      ? tinycolor("#ffffff").setAlpha(0.7).toRgbString()
      : tinycolor("#000000").setAlpha(0.7).toRgbString(),
    "text-disabled": base.isDark()
      ? tinycolor("#ffffff").setAlpha(0.5).toRgbString()
      : tinycolor("#000000").setAlpha(0.5).toRgbString(),

    // Background colors
    "background-default": base.clone().lighten(45).desaturate(85).toHexString(),
    "background-paper": base.clone().lighten(50).desaturate(85).toHexString(),
    "background-hover": base.clone().lighten(47).desaturate(80).toHexString(),
    "background-selected": base
      .clone()
      .lighten(43)
      .desaturate(75)
      .toHexString(),
    "background-disabled": base
      .clone()
      .lighten(45)
      .desaturate(85)
      .setAlpha(0.12)
      .toRgbString(),

    // Border colors
    "border-default": base.clone().setAlpha(0.12).toRgbString(),
  };
}

export async function extractPageColors(): Promise<Record<string, string>> {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) throw new Error("No active tab found");

    // Execute script to analyze page colors
    const result = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        function getVisibleElements() {
          return [...document.querySelectorAll("*")].filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
        }

        function getComputedColors(): ColorCollection {
          const colors: ColorCollection = {
            background: {},
            text: {},
            border: {},
          };

          const elements = getVisibleElements();
          elements.forEach((el) => {
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const weight = Math.round(rect.width * rect.height);

            // Background colors
            const bgColor = style.backgroundColor;
            if (
              bgColor &&
              bgColor !== "rgba(0, 0, 0, 0)" &&
              bgColor !== "transparent"
            ) {
              colors.background[bgColor] =
                (colors.background[bgColor] || 0) + weight;
            }

            // Text colors
            const textColor = style.color;
            if (textColor) {
              colors.text[textColor] = (colors.text[textColor] || 0) + weight;
            }

            // Border colors
            const borderColor = style.borderColor;
            if (
              borderColor &&
              borderColor !== "rgba(0, 0, 0, 0)" &&
              borderColor !== "transparent"
            ) {
              colors.border[borderColor] =
                (colors.border[borderColor] || 0) + weight;
            }
          });

          return colors;
        }

        function getMostFrequentColors(
          colorMap: ColorCounts,
          count = 3
        ): string[] {
          return Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([color]) => color);
        }

        const allColors = getComputedColors();
        const dominantColors = {
          backgrounds: getMostFrequentColors(allColors.background),
          text: getMostFrequentColors(allColors.text),
          borders: getMostFrequentColors(allColors.border),
        };

        return dominantColors;
      },
    });

    const colorData = result[0].result;
    if (!colorData) {
      throw new Error("Could not extract colors from page");
    }

    // Use the most dominant background color as our base
    const baseColor = colorData.backgrounds[0] || "#1976d2";
    const themeColors = generateThemeColors(baseColor);

    // Convert to CSS variables
    const colors: Record<string, string> = {};
    Object.entries(themeColors).forEach(([key, value]) => {
      colors[`--color-${key}`] = value;
    });

    console.log("[Color Extractor] Final theme colors:", colors);
    return colors;
  } catch (error) {
    console.error("[Color Extractor] Failed to extract page colors:", error);
    // Return default colors on error
    return generateThemeColors("#1976d2");
  }
}
