import p5 from 'p5';
import { Cell } from './Cell';
import { CellBrush } from './CellBrush';
import { getBindedP5Functions } from './lib/getBindedP5Functions';
import { s } from './store';
import { isWithinRange } from './utils/isWithinRange';
import { randomArrayItem } from './utils/randomArrayItem';
import Logger from '@aliser/logger';
const { logError } = new Logger();

// 

const canvasSize = {
    w: 800,
    h: 640
};

const fps = 144;

const cellSizePx = 5;
s.cellSizePx = cellSizePx;

const updatesPerSecond = 40;

const brushRadius = 3;

/** 
 * chance to move the side (per second) if position below is occupied 
 * and atleast one side is available 
 * */
const chanceToMoveToSidePerSec = 5 / 1;
s.chanceToMoveToSidePerSec = chanceToMoveToSidePerSec;

/** 
 * шанс заменить ячейку легче ниже, в секунду. 
 * считается вместеп с {@link chanceToReplaceLighterCellPerWeight}
*/
const chanceToReplaceLighterCellPerSec = 30 / 1;
s.chanceToReplaceLighterCellPerSec = chanceToReplaceLighterCellPerSec;


/** 
 * шанс заменить ячейку ниже весом на 1 ниже. больше вес - больше шанс.
 * зависит от шанса {@link chanceToReplaceLighterCellPerSec}.
 */
const chanceToReplaceLighterCellPerWeight = 10 / 1;
s.chanceToReplaceLighterCellPerWeight = chanceToReplaceLighterCellPerWeight;


const colorPalleteStrArr: string[][] = [
    [
        'hsl(30, 80%, 60%)', // Light Amber Sand
        'hsl(30, 80%, 50%)',
        'hsl(30, 80%, 40%)',
        'hsl(30, 80%, 30%)',
        'hsl(30, 80%, 20%)'
    ],
    // [
    //     'hsl(320, 100%, 70%)', // Light Lavender Sand
    //     'hsl(320, 100%, 60%)',
    //     'hsl(320, 100%, 50%)',
    //     'hsl(320, 100%, 40%)',
    //     'hsl(320, 100%, 30%)'
    // ],
    // [
    //     'hsl(50, 100%, 55%)', // Light Peach Sand
    //     'hsl(50, 100%, 45%)',
    //     'hsl(50, 100%, 35%)',
    //     'hsl(50, 100%, 25%)',
    //     'hsl(50, 100%, 15%)'
    // ]
];

// 

const cellsPerSide = {
    h: Math.floor(canvasSize.h / cellSizePx),
    w: Math.floor(canvasSize.w / cellSizePx),
}
s.cellsPerSide = cellsPerSide;

const fpsDt = 1 / fps;
const updatesDt = 1 / updatesPerSecond;

/** Фрейм, если при вычислении остатка прошедшего кол-ва фреймов от которого получится 0, произойдет обновление. */
const frameOfUpdate = Math.round(fps / updatesPerSecond);

/** A modifier based on number of updates per second, applied to all chance calculation. */
const chancePerSecModifier = updatesDt;
s.chancePerSecModifier = chancePerSecModifier;

/**
 * An array of all cells.
 */
const cells: Cell[] = [];

/**
 * The grid of cells.
 * 
 * First array is columns, second — rows.
 */
const cellsBySide: Cell[][] = [];

// 

new p5(p5InstanceUntyped => {
    s.p = p5InstanceUntyped as p5;
    s.pfn = getBindedP5Functions(s.p);
    const { p, pfn } = s;

    const {
        createCanvas,
        colorMode,
        rect,
        background,
        fill,
        stroke,
        frameRate,
        constrain: clamp,
        color,
        noFill,
        noStroke,
        text
    } = pfn;
    const { HSL, mouseX, mouseY, createVector } = p;

    // 

    const colorPallete: p5.Color[][] = [];

    const brush = new CellBrush(brushRadius, 'rect');

    // 

    const isCellPosOccupied = (pos: p5.Vector): boolean => {
        if (!isWithinRange(pos.x, 0, cellsPerSide.w)
            || !isWithinRange(pos.y, 0, cellsPerSide.h)
        ) {
            logError('cannot check if the cell occupied outside the bounds', {
                throwErr: true
            });
        }

        return cellsBySide[pos.x][pos.y] !== undefined;
    }
    s.isCellPosOccupied = isCellPosOccupied;

    /**
     * Applies the movement of a cell to the cell arrays.
     * @param cell The cell that just moved.
     */
    const markCellMovement = (cell: Cell, oldPos: p5.Vector, newPos: p5.Vector, {
        ignoreOccupiedCells = false
    }: Partial<{
        /** 
         * Ignores occupied cells, overriding them.
         * 
         * @default
         * false
         */
        ignoreOccupiedCells: boolean
    }> = {}): void => {
        if (!ignoreOccupiedCells && isCellPosOccupied(newPos)) {
            logError('cannot move cell to an already occupied position',
                {
                    fromPos: oldPos,
                    toPos: newPos
                },
                { throwErr: true }
            );
            throw '' // type guard
        }

        delete cellsBySide[oldPos.x][oldPos.y];
        cellsBySide[newPos.x][newPos.y] = cell;
    }
    s.markCellMovement = markCellMovement;

    const addCell = (cell: Cell, pos: p5.Vector): void => {
        cellsBySide[pos.x][pos.y] = cell;
        cells.push(cell);
    }
    s.addCell = addCell;

    /**
     * Retrieves the cell at the specified position.
     *
     * @param {p5.Vector} pos - the position of the cell
     * @return {Cell} the cell at the specified position
     * @throws when the cell is outside the bounds or no cell exists at the specified position.
     */
    const getCellByPos = (pos: p5.Vector): Cell => {
        if (!isWithinRange(pos.x, 0, cellsPerSide.w)
            || !isWithinRange(pos.y, 0, cellsPerSide.h)
        ) {
            logError('cannot get the cell outside the bounds', {
                pos
            }, {
                throwErr: true
            });
        }

        const cell = cellsBySide[pos.x][pos.y];
        if (!cell) {
            logError('no cell at given position', {
                pos
            }, {
                throwErr: true
            });
            throw '' // type guard
        }

        return cell;
    }
    s.getCellByPos = getCellByPos;

    /**
     * Swaps two cells places.
     */
    const swapCells = (cell1: Cell, cell2: Cell): void => {
        const cell1Pos = cell1.cellPos.copy();
        cell1.setPos(cell2.cellPos, { markMovementToArrays: false });
        cell2.setPos(cell1Pos, { markMovementToArrays: false });

        // set the new cell positions
        cellsBySide[cell1.cellPos.x][cell1.cellPos.y] = cell1;
        cellsBySide[cell2.cellPos.x][cell2.cellPos.y] = cell2;
    }
    s.swapCells = swapCells;

    // 

    p.setup = () => {
        createCanvas(canvasSize.w, canvasSize.h);
        colorMode(HSL);
        frameRate(fps);

        noStroke();
        // stroke('hsla(0, 0%, 10%, .25)');

        for (let col = 0; col < cellsPerSide.w; col++) {
            const cellRow: Cell[] = [];
            cellsBySide.push(cellRow);
        }

        for (const palleteEntryArr of colorPalleteStrArr) {
            const colorVariants: p5.Color[] = [];
            colorPallete.push(colorVariants);

            for (const palleteEntry of palleteEntryArr) {
                colorVariants.push(color(palleteEntry));
            }
        }

        // set some initial params - I hope you will not be mad, daddy!
        p.mouseReleased();
    };

    p.mouseReleased = () => {
        // set params to use for the next time
        const palleteColorVariants = randomArrayItem(colorPallete);
        const palleteColor = randomArrayItem(palleteColorVariants);
        s.currentPalleteColor = palleteColor;

        s.currentCellWeight = 1 + palleteColorVariants.indexOf(palleteColor);
    }

    p.draw = () => {
        background(95);

        const cellMousePos = getCellPositionFromMouse();

        // create new cell at mouse pos if it doesn't exist yet
        if (p.mouseIsPressed) {
            brush.use(cellMousePos);
        }

        // 



        if (p.frameCount % frameOfUpdate === 0) {
            for (const cell of cells) {
                cell.update();
            }
        }

        fill('red')
        for (const cell of cells) {
            cell.draw();
        }

        // 

        fill('black');
        text(`FPS (current): ${Math.round(frameRate())}`, 20, 20);
        text(`Cell count: ${cells.length}`, 20, 40);
    }
}, document.getElementById('app')!);

function getCellPositionFromMouse() {
    const { createVector, constrain: clamp } = s.pfn;
    const { mouseX, mouseY } = s.p;

    return createVector(
        clamp(Math.round(mouseX / cellSizePx), 0, cellsPerSide.w - 1),
        clamp(Math.round(mouseY / cellSizePx), 0, cellsPerSide.h - 1)
    )
}