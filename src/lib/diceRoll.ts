import Logger from '@aliser/logger';
import { s } from '../store';
import { isWithinRange } from '../utils/isWithinRange';
import { randomNumberInRange } from '../utils/randomNumberInRange';
const { logError } = new Logger();

/**
 * Rolls a random number and compares it to the given probability `chance` (from `0` to `1`).
 * 
 * @param chance The probability of success.
 * @param options Additional options for the dice roll.
 * @param options.applyChancePerSecModifier Whether to modify the chance based on updates per second.
 * @returns A boolean indicating success or failure based on the probability.
 */
export function diceRoll(chance: number, options: { applyChancePerSecModifier?: boolean } = {}): boolean {
    if (options.applyChancePerSecModifier) {
        return randomNumberInRange(0, 1) < (chance * s.chancePerSecModifier);
    } else {
        return randomNumberInRange(0, 1) < chance;
    }
}