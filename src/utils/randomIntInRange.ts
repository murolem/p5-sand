import { randomNumberInRange } from './randomNumberInRange';

export function randomIntInRange(low: number, high: number): number {
  return Math.round(randomNumberInRange(low, high));
}