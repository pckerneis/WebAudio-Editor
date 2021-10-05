export function arePrimitiveArraysEqual(first: any[], second: any[]) {
  return first.length === second.length
    && first.every((element, index) => second[index] === element);
}

export function allTruthy(elements: any[]): boolean {
  return elements.every(Boolean);
}


export function anyTruthy(elements: any[]): boolean {
  return elements.some(Boolean);
}
