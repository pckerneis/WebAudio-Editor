import SequenceGenerator from './SequenceGenerator';

export function nextId(prefix: string, knownIds: string[]): string {
  const sequenceGenerator = new SequenceGenerator();

  let result: string;

  do {
    result = generateCandidate(prefix, sequenceGenerator);
  } while (knownIds.includes(result));

  return result;
}

function generateCandidate(prefix: string, sequenceGenerator: SequenceGenerator): string {
  return `${prefix}${sequenceGenerator.nextString()}`;
}
