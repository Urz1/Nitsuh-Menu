import QRCode from 'qrcode';

export interface QrSvgOptions {
  color?: string;
  bgColor?: string;
  margin?: number;
  logoUrl?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QrPngOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  logoUrl?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Synchronously generates a crisp, resolution-independent SVG string for a given text/URL.
 * Supports embedded logo overlay in the center with High error correction (30% redundancy).
 * Runs 100% offline without any external network requests or third-party APIs.
 */
export function generateQrSvgString(text: string, options: QrSvgOptions = {}): string {
  const {
    color = '#111827',
    bgColor = '#ffffff',
    margin = 1,
    logoUrl,
    errorCorrectionLevel = logoUrl ? 'H' : 'M',
  } = options;

  try {
    const qr = QRCode.create(text, { errorCorrectionLevel });
    const moduleCount = qr.modules.size;
    const totalSize = moduleCount + margin * 2;

    let path = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          path += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    let logoOverlay = '';
    if (logoUrl) {
      // Allocate ~22% of QR code width for the center logo badge
      const logoRatio = 0.22;
      const logoSize = Math.round(totalSize * logoRatio);
      const shieldPadding = Math.max(1, Math.round(totalSize * 0.025));
      const shieldSize = logoSize + shieldPadding * 2;
      const shieldX = (totalSize - shieldSize) / 2;
      const shieldY = (totalSize - shieldSize) / 2;
      const logoX = (totalSize - logoSize) / 2;
      const logoY = (totalSize - logoSize) / 2;
      const rx = Math.round(shieldSize * 0.22);

      logoOverlay = `
        <rect x="${shieldX}" y="${shieldY}" width="${shieldSize}" height="${shieldSize}" rx="${rx}" fill="#ffffff" stroke="${color}" stroke-width="0.3"/>
        <image href="${logoUrl}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>
      `.trim();
    }

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">` +
      (bgColor ? `<rect width="${totalSize}" height="${totalSize}" fill="${bgColor}"/>` : '') +
      `<path d="${path.trim()}" fill="${color}"/>` +
      (logoOverlay ? `<g shape-rendering="auto">${logoOverlay}</g>` : '') +
      `</svg>`
    );
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" font-size="10" text-anchor="middle">QR Error</text></svg>`;
  }
}

/**
 * Returns a data:image/svg+xml URI suitable for <img src="..." />
 */
export function generateQrSvgDataUri(text: string, options: QrSvgOptions = {}): string {
  const svg = generateQrSvgString(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Asynchronously generates a PNG data URL (base64) using canvas/node-qrcode.
 */
export async function generateQrPngDataUrl(text: string, options: QrPngOptions = {}): Promise<string> {
  const {
    width = 400,
    margin = 1,
    color = { dark: '#111827', light: '#ffffff' },
    errorCorrectionLevel = options.logoUrl ? 'H' : 'M',
  } = options;

  return QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel,
  });
}
