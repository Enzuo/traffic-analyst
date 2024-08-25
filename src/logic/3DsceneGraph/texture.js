import * as THREE from 'three'

const PALETTES = {
  "blue" : [[64,122,171],[46,99,144],[80,137,186]],
  "red": [[197,41,67], [161,20,43], [209,66,89]],
  "orange": [[220,130,50], [184,105,34], [221,148,83]],
  "green": [[72,147,77], [56,125,61], [121,169,125]],
  "purple": [[144,92,168], [118,69,138],[161,121,177]],
}

const DEFAULT_PALETTE = [[245,245,245],[210,210,210],[255,255,255]]


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
  const currentPalette = getTexturePalette(imageData)
  const newPalette = PALETTES[color] || DEFAULT_PALETTE
  replacePalette(imageData, currentPalette, newPalette)
  context.putImageData(imageData, 0, 0);

  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.needsUpdate = true;
  newTexture.minFilter = THREE.NearestMipmapNearestFilter
  newTexture.magFilter = THREE.NearestFilter
  newTexture.flipY = false // FLIP as Y-axis in the WebGL coordinate system is inverted compared to the canvas coordinate system

  return newTexture
}

/**
 * Sample the palette from a texture
 * The palette is the first 5 pixel of that texture.
 * That palette describe colors that aren't generic and can be changed to change the car color
 */
function getTexturePalette (imageData) {
  const palette = []
  for (let i = 0; i < 20; i += 4) {
    const [r, g, b] = imageData.data.slice(i, i + 3)
    // if not already in palette // might have to change this so palette are always the same size of 5
    if(findColorInPalette([r,g,b], palette) < 0){
      palette.push([r, g, b])
    }
  }
  return palette
}

function replacePalette (imageData, currentPalette, newPalette) {
  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b] = imageData.data.slice(i, i + 3);
    const paletteIndex = findColorInPalette([r, g, b], currentPalette)
    if(paletteIndex >= 0){
      const [newR, newG, newB] = newPalette.length > paletteIndex ? newPalette[paletteIndex] : [r, g ,b]
      imageData.data.set([newR, newG, newB], i);
    }
  }
  return imageData
}

function findColorInPalette([r, g, b], palette){
  return palette.findIndex((a) => {
    return a[0] === r && a[1] === g && a[2] === b
  })
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