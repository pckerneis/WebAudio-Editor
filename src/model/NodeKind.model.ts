export enum NodeKind {
  osc = 'osc',
  gain = 'gain',
  delay = 'delay',
  analyser = 'analyser',
  biquadFilter = 'biquadFilter',
  audioBufferSource = 'audioBufferSource',
  channelMerger = 'channelMerger',
  channelSplitter = 'channelSplitter',
  constantSource = 'constantSource',
  convolver = 'convolver',
  dynamicsCompressor = 'dynamicsCompressor',
  iirFilter = 'iirFilter',
  mediaElementAudioSource = 'mediaElementAudioSource',
  mediaStreamAudioDestination = 'mediaStreamAudioDestination',
  mediaStreamAudioSource = 'mediaStreamAudioSource',
  mediaStreamTrackAudioSource = 'mediaStreamTrackAudioSource',
  panner = 'panner',
}

export function isNodeKind(candidate: any): candidate is NodeKind {
  return Object.values(NodeKind).includes(candidate as NodeKind);
}
