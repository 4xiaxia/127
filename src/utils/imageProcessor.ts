
/**
 * Image Processor Utility
 * Handles client-side resizing, smart cropping (center-weighted), and compression.
 */

interface ProcessOptions {
  width: number;
  height: number;
  quality?: number; // 0 to 1, default 0.8
  format?: 'image/jpeg' | 'image/png';
}

/**
 * Processes an image file: Auto-crops to aspect ratio (cover) and compresses.
 * Returns a Promise resolving to a Base64 string.
 */
export const processImage = (file: File, options: ProcessOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // 1. Calculate Aspect Ratios
        const sourceRatio = img.width / img.height;
        const targetRatio = options.width / options.height;
        
        let renderWidth = img.width;
        let renderHeight = img.height;
        let offsetX = 0;
        let offsetY = 0;

        // 2. Calculate "Object-Fit: Cover" logic (Smart Center Crop)
        if (sourceRatio > targetRatio) {
          // Source is wider than target: Crop sides
          renderWidth = img.height * targetRatio;
          renderHeight = img.height;
          offsetX = (img.width - renderWidth) / 2;
        } else {
          // Source is taller than target: Crop top/bottom
          renderWidth = img.width;
          renderHeight = img.width / targetRatio;
          offsetY = (img.height - renderHeight) / 2;
          // Optional: Bias crop slightly towards top for portraits (faces are usually higher)
          if (options.height > options.width) { 
             offsetY = (img.height - renderHeight) / 3; 
          }
        }

        // 3. Draw to Canvas
        const canvas = document.createElement('canvas');
        canvas.width = options.width;
        canvas.height = options.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error("Browser does not support Canvas"));
          return;
        }

        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img, 
          offsetX, offsetY, renderWidth, renderHeight, // Source Crop
          0, 0, options.width, options.height          // Destination Resize
        );

        // 4. Export compressed Data URL
        const quality = options.quality || 0.8;
        const format = options.format || 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, quality);
        
        resolve(dataUrl);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};
