export function unique<T>(array: T[]): T[] {
  return array.filter((value, i) => array.indexOf(value) === i);
}

export function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => i + min);
}

export function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRandomNumber(min: number, max: number): number {
  return sample(range(min, max));
}
