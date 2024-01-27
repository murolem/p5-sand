import p5 from 'p5';
import { P5InstanceFunctions } from './types';
import { Cell } from './Cell';
import { isWithinRange } from './utils/isWithinRange';

let p: p5 | undefined = undefined;
let pfn: P5InstanceFunctions | undefined = undefined;

export const s: {
    // set in init
    p: p5,
    pfn: P5InstanceFunctions,

    cellSizePx: number,
    cellsPerSide: { w: number, h: number },
    chancePerSecModifier: number,
    chanceToMoveToSidePerSec: number,
    chanceToReplaceLighterCellPerWeight: number;
    chanceToReplaceLighterCellPerSec: number,

    currentPalleteColor: p5.Color,
    currentCellWeight: number;

    isCellPosOccupied(pos: p5.Vector): boolean,
    markCellMovement(cell: Cell, oldPos: p5.Vector, newPos: p5.Vector): void,
    addCell(cell: Cell, pos: p5.Vector): void,
    getCellByPos(pos: p5.Vector): Cell,
    swapCells(cell1: Cell, cell2: Cell): void,


    // set here
    isCellPosWithinCellGrid(pos: p5.Vector): boolean,
    // canvasSize: { w: number, h: number },
    // fps: number,
    // updatesPerSecond: number,
    // chanceToMoveToSidePerSec: number,
    // colorPalleteStrArr: string[],
    // fpsDt: number,
    // updatesDt: number,
    // frameOfUpdate: number,
} = {
    // set in init
    // @ts-ignore
    p: undefined,
    // @ts-ignore
    pfn: undefined,

    cellSizePx: 0,
    // @ts-ignore
    cellsPerSide: undefined,
    chancePerSecModifier: 0,
    chanceToMoveToSidePerSec: 0,
    chanceToReplaceLighterCellPerWeight: 0,
    chanceToReplaceLighterCellPerSec: 0,

    // @ts-ignore
    currentPalleteColor: undefined,
    currentCellWeight: 0,

    // @ts-ignore
    isCellPosOccupied: undefined,
    // @ts-ignore
    markCellMovement: undefined,
    // @ts-ignore
    addCell: undefined,
    // @ts-ignore
    getCellByPos: undefined,
    // @ts-ignore
    swapCells: undefined,


    // set here

    isCellPosWithinCellGrid(pos) {
        return isWithinRange(pos.x, 0, s.cellsPerSide.w)
            && isWithinRange(pos.y, 0, s.cellsPerSide.h);
    }
}