import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";

export const exportCardAsImage = async (
  elementId,
  fileName = "birthday-card"
) => {
  const cardElement = document.getElementById(elementId);

  if (!cardElement) {
    console.error("Card element not found");
    return null;
  }

  try {
    // Temporarily hide buttons before capture
    const buttons = cardElement.querySelector(".button-container");
    if (buttons) buttons.style.display = "none";

    // Generate image with higher quality
    const dataUrl = await htmlToImage.toPng(cardElement, {
      quality: 1,
      pixelRatio: 2, // For higher resolution
      backgroundColor: "#f7ebe0", // Match your card background
    });

    // Restore buttons visibility
    if (buttons) buttons.style.display = "flex";

    // Optional: auto-download for testing
    saveAs(dataUrl, `${fileName}.png`);

    return dataUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
