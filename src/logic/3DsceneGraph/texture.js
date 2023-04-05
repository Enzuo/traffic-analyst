import * as THREE from 'three'

export function changeTextureColor(texture, color) {
  if(!texture) return null

  // create a canvas element to modify the texture
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = texture.image.width;
  canvas.height = texture.image.height;
  context.drawImage(texture.image, 0, 0);

  // modify the hue of the canvas
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b] = imageData.data.slice(i, i + 3);
    const [h, s, l] = rgbToHsl(r, g, b); // convert RGB to HSL
    const [newR, newG, newB] = hslToRgb(0.2, s, l); // modify the hue
    imageData.data.set([newR, newG, newB], i);
  }
  context.putImageData(imageData, 0, 0);

  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.needsUpdate = true;
  newTexture.minFilter = THREE.NearestMipmapNearestFilter
  newTexture.magFilter = THREE.NearestFilter
  newTexture.flipY = false // FLIP as Y-axis in the WebGL coordinate system is inverted compared to the canvas coordinate system

  return newTexture
}


function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
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
  return [h, s, l];
}

// Converts an HSL color value to RGB (red, green, blue)
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}