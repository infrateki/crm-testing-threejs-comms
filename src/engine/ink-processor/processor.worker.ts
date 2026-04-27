import { toGrayscale } from './grayscale';
import { gaussianBlur } from './gaussian-blur';
import { sobelEdges } from './sobel-edges';
import { adaptiveThreshold } from './adaptive-threshold';
import { applyLineWeight } from './line-weight';
import { applyHatching } from './hatching';
import type { WorkerRequest, WorkerResponse } from './types';

const workerCtx = self as unknown as DedicatedWorkerGlobalScope;

workerCtx.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { imageData, config, includeIntermediates } = e.data;
  const { width, height } = imageData;

  const grayscale = toGrayscale(imageData);
  const blurred = gaussianBlur(grayscale, width, height, config.sigma);
  const { magnitude, direction } = sobelEdges(blurred, width, height);
  const thresholded = adaptiveThreshold(magnitude, config.threshold);
  const weighted = applyLineWeight(magnitude, thresholded, config.lineWeight);
  const edges = config.hatching
    ? applyHatching(weighted, grayscale, direction, width, height)
    : weighted;

  const edgesBuf = edges.buffer as ArrayBuffer;
  const magBuf = magnitude.buffer as ArrayBuffer;
  const dirBuf = direction.buffer as ArrayBuffer;
  const grayBuf = grayscale.buffer as ArrayBuffer;

  const transferables: Transferable[] = [edgesBuf, magBuf, dirBuf, grayBuf];

  const response: WorkerResponse = {
    edgesBuffer: edgesBuf,
    magnitudeBuffer: magBuf,
    directionBuffer: dirBuf,
    grayscaleBuffer: grayBuf,
    width,
    height,
  };

  if (includeIntermediates) {
    const blurredBuf = blurred.buffer as ArrayBuffer;
    const threshBuf = thresholded.buffer as ArrayBuffer;
    response.intermediateBuffers = [blurredBuf, threshBuf];
    transferables.push(blurredBuf, threshBuf);
  }

  workerCtx.postMessage(response, transferables);
};
