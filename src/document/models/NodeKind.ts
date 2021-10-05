export enum NodeKind {
  osc = 'osc',
  gain = 'gain',
  delay = 'delay',
  analyser = 'analyser',
  biquadFilter = 'biquadFilter',
  bufferSource = 'bufferSource',
  channelMerger = 'channelMerger',
  channelSplitter = 'channelSplitter',
  constantSource = 'constantSource',
  convolver = 'convolver',
  dynamicsCompressor = 'dynamicsCompressor',
  iirFilter = 'iirFilter',
  mediaElementSource = 'mediaElementSource',
  mediaStreamDestination = 'mediaStreamDestination',
  mediaStreamSource = 'mediaStreamSource',
  panner = 'panner',
  destination = 'destination',
}

export function isNodeKind(candidate: any): candidate is NodeKind {
  return Object.values(NodeKind).includes(candidate as NodeKind);
}
