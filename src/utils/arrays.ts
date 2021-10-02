export function arePrimitiveArraysEqual(first: any[], second: any[]) {
  return first.length === second.length
    && first.every((element, index) => second[index] === element);
}
