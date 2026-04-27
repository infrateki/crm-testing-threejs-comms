// ITU-R BT.709 luminance coefficients
export function toGrayscale(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const out = new Float32Array(width * height);
  for (let i = 0; i < out.length; i++) {
    const p = i * 4;
    out[i] = 0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2];
  }
  return out;
}
