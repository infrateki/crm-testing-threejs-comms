function makeKernel(sigma: number): Float32Array {
  const size = (Math.ceil(sigma * 6) | 1);
  const half = Math.floor(size / 2);
  const kernel = new Float32Array(size);
  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - half;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  for (let i = 0; i < size; i++) kernel[i] /= sum;
  return kernel;
}

export function gaussianBlur(
  data: Float32Array,
  width: number,
  height: number,
  sigma: number
): Float32Array {
  const kernel = makeKernel(sigma);
  const half = Math.floor(kernel.length / 2);
  const tmp = new Float32Array(width * height);
  const out = new Float32Array(width * height);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const sx = Math.min(width - 1, Math.max(0, x + k - half));
        sum += data[y * width + sx] * kernel[k];
      }
      tmp[y * width + x] = sum;
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const sy = Math.min(height - 1, Math.max(0, y + k - half));
        sum += tmp[sy * width + x] * kernel[k];
      }
      out[y * width + x] = sum;
    }
  }

  return out;
}
