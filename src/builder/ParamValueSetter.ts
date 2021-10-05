export interface ParamValueSetter {
  handleValueChange(node: AudioNode, paramName: string, paramValue: any): boolean;
}

export class AudioParamValueSetter implements ParamValueSetter {
  handleValueChange(audioNode: AudioNode, paramName: string, value: any): boolean {
    if (paramName in audioNode) {
      const candidate: any = audioNode[paramName as keyof AudioNode];

      if (candidate instanceof AudioParam) {
        candidate.setValueAtTime(value, 0);
        return true;
      }
    }

    return false;
  }
}

export class OwnPropertyValueSetter implements ParamValueSetter {
  handleValueChange(audioNode: AudioNode, paramName: string, value: any): boolean {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(audioNode, paramName);

    if (propertyDescriptor && propertyDescriptor.writable) {
      (audioNode[paramName as keyof AudioNode] as any) = value;
      return true;
    }

    return false;
  }
}

export class AudioScheduledSourceNodeValueSetter implements ParamValueSetter {
  handleValueChange(audioNode: AudioNode, paramName: string, value: any): boolean {
    if (audioNode instanceof AudioScheduledSourceNode && (paramName as any) === 'started') {
      if (value) {
        audioNode.start(0);
      }
      return true;
    }

    return false;
  }
}

export class OscillatorNodeValueSetter implements ParamValueSetter {
  handleValueChange(audioNode: AudioNode, paramName: string, value: any): boolean {
    // I don't get why I need this special handler... Cannot find 'type' property on my
    // OscillatorNode instance, even by walking up the prototypes chain
    if (audioNode instanceof OscillatorNode && (paramName as any) === 'type') {
      audioNode.type = value;
      return true;
    }

    return false;
  }
}
