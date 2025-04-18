export const getMetaTag = (name: string): string | null => {
  console.log("[Content] Getting meta tag:", name);

  const metaTag = document.querySelector(`meta[name="${name}"]`);
  const value = metaTag?.getAttribute("content") || null;

  console.log("[Content] Meta tag value:", { name, value });
  return value;
};
