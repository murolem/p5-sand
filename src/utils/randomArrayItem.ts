import { randomIntInRange } from './randomIntInRange';

export function randomArrayItem<T>(array: T[]): T {
  return array[randomIntInRange(0, array.length - 1)];
}