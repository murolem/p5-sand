// 

import p5 from 'p5';
import { s } from './store';
import { diceRoll } from './lib/diceRoll';
import Logger from '@aliser/logger';
const { logInfo } = new Logger();

export class Cell {
    cellPos: p5.Vector;
    weight: number;
    col: p5.Color;

    constructor(args: {
        cellPos: p5.Vector,
        weight: number,
        color: p5.Color,
    }) {
        this.cellPos = args.cellPos;
        this.weight = args.weight;
        this.col = args.color;
    }

    /**
     * Update the position of the cell and return the result.
     *
     * @return {object} An object indicating whether the position has changed and, if so, the old and new positions.
     */
    update(): void {
        const { createVector } = s.pfn;
        const { } = s.p;

        const oldPosition = this.cellPos.copy();

        // calc the initial pos prediciton

        // this is the new position
        // WARN: be careful when changing the logic here,
        // since some of the calculations below rely on exactly this delta.
        const newPosition = this.cellPos.copy()
            .add(0, 1);

        // check for grid bounds - if the position is outside the grid, 
        // bring it back into the bounds

        if (newPosition.x < 0) newPosition.x = 0;
        else if (newPosition.x > s.cellsPerSide.w) newPosition.x = s.cellsPerSide.w - 1;

        if (newPosition.y < 0) newPosition.y = 0;
        else if (newPosition.y > s.cellsPerSide.h - 1) newPosition.y = s.cellsPerSide.h - 1;

        // check if the calculated position differs from the current one.
        // if a position doesn't change, that means we've reached the bounds 
        // and will not move further into any direction.

        if (newPosition.equals(oldPosition)) {
            return;
        }

        // if the new position did change, check if its occupied
        if (s.isCellPosOccupied(newPosition)) {
            // if it is occupied - check if the cell:
            // 1. can move below, replacing the lighter cell. 
            // 2. and if not - check if the cell can go to the sides instead.

            const cellAtNewPos = s.getCellByPos(newPosition);

            // ==========
            // CHECKING FOR REPLACING THE LIGHTER CELL BELOW
            // ==========
            const wasCurrentCellSwappedWithCellAtNewPosition = (() => {
                // check for chance to replace the cell bellow, if it to were lighter
                const chanceToReplaceTheLighterCellBelow = diceRoll(
                    s.chanceToReplaceLighterCellPerSec, {
                    applyChancePerSecModifier: true
                });

                // if the chance is not there or the cell below is of same (or more) weight,
                // do nothing here. 
                if (!chanceToReplaceTheLighterCellBelow || cellAtNewPos.weight >= this.weight) {
                    return false;
                }

                // if the chance is there and the cell below is lighter, 
                // check for another chance based on the weight and replace the cell
                // if the stars finally do align. 
                const chanceByWeight = diceRoll(
                    s.chanceToReplaceLighterCellPerWeight * (this.weight - cellAtNewPos.weight), {
                    applyChancePerSecModifier: true
                });

                // return the the chance by weight just wasn't there :(
                if (!chanceByWeight) {
                    return false;
                }

                // and finally, swap em places!
                s.swapCells(this, cellAtNewPos);

                return true;
            })();

            // do not do anything else if the cells were swapped
            if (wasCurrentCellSwappedWithCellAtNewPosition) {
                return;
            }


            // ==========
            // CHECKING FOR MOVING TO THE SIDES
            // ==========

            // Check for chance to move to the sides
            const chanceToMoveToSide = diceRoll(s.chanceToMoveToSidePerSec, {
                applyChancePerSecModifier: true
            });

            if (!chanceToMoveToSide) {
                // Do not change position if chance is not on our side
                return;
            }

            // Check if the sides are available for movement
            const isLeftAvailable = newPosition.x - 1 >= 0 && !s.isCellPosOccupied(newPosition.copy().add(-1, 0));
            const isRightAvailable = newPosition.x + 1 < s.cellsPerSide.w && !s.isCellPosOccupied(newPosition.copy().add(1, 0));

            if (!isLeftAvailable && !isRightAvailable) {
                // Do not change position if neither side is available
                return;
            }

            // Move to the available side
            if (isLeftAvailable && isRightAvailable) {
                // If both sides are available, randomly pick one
                if (diceRoll(.5)) {
                    // Move to the left
                    newPosition.x--;
                } else {
                    // Move to the right
                    newPosition.x++;
                }
            } else if (isLeftAvailable) {
                // Move to the left if only left side is available
                newPosition.x--;
            } else {
                // Move to the right if only right side is available
                newPosition.x++;
            }
        }

        // set the pos

        this.setPos(newPosition);
    }

    setPos(pos: p5.Vector, {
        markMovementToArrays = true
    }: Partial<{
        /**
         * Whether to mark movement to the cell arrays.
         * 
         * @default
         * true
         */
        markMovementToArrays: boolean
    }> = {}): void {
        if (markMovementToArrays)
            s.markCellMovement(this, this.cellPos, pos);

        this.cellPos = pos;
    }

    draw() {
        const { rect, fill } = s.pfn;
        const { } = s.p;

        fill(this.col);
        rect(
            this.cellPos.x * s.cellSizePx,
            this.cellPos.y * s.cellSizePx,
            s.cellSizePx
        );
    }
}