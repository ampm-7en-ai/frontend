export const adjustColorForDarkTheme = (hex, brightnessFactor = 1.5, saturationFactor = 1.2) => {
  // Normalize hex code (remove #, handle 3-digit or 6-digit)
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // Achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // Achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Get HSL values
  let [h, s, l] = rgbToHsl(r, g, b);

  // Adjust lightness and saturation
  l = Math.min(100, l * brightnessFactor); // Increase brightness (cap at 100%)
  s = Math.min(100, s * saturationFactor); // Increase saturation (cap at 100%)

  // Ensure light colors for dark theme (e.g., minimum lightness of 60%)
  l = Math.max(60, l);

  // Convert back to RGB
  const [newR, newG, newB] = hslToRgb(h, s, l);

  // Convert RGB to hex
  const toHex = (value) => {
    const hex = value.toString(16).padStart(2, '0');
    return hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}