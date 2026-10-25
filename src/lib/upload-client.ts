'use client';

/**
 * Compresses an image file in the browser using HTML5 Canvas
 * to minimize mobile upload bandwidth and speed up Cloudinary ingestion.
 */
export function compressImage(
  file: File,
  maxDim: number = 800,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a base64 data string to the /api/upload endpoint which securely
 * sends it to Cloudinary. Returns the permanent Cloudinary HTTPS URL.
 * Falls back to the base64 string if credentials are not yet configured or offline.
 */
export async function uploadImageToCloudinary(
  base64Data: string,
  folder: string = 'nitsuh-menu/dishes'
): Promise<string> {
  if (!base64Data || !base64Data.startsWith('data:')) {
    return base64Data;
  }

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data, folder }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.url || base64Data;
    }
  } catch (err) {
    console.warn('Image upload fallback to local data URL:', err);
  }
  return base64Data;
}
