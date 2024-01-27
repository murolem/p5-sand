import Logger from '@aliser/logger';
import p5 from 'p5';
import { s } from './store';
import { Cell } from './Cell';
const { logError } = new Logger();

export type BrushShape =
    'rect'
    ;

export class CellBrush {
    radius: number;
    shape: BrushShape;

    constructor(radius: number, shape: BrushShape) {
        this.radius = radius;
        this.shape = shape;
    }

    use(cellPos: p5.Vector): void {
        const { constrain, createVector } = s.pfn;
        const { } = s.p;

        switch (this.shape) {
            case 'rect':
                let col = constrain(cellPos.x - this.radius, 0, s.cellsPerSide.w - 1);
                const colLim = constrain(cellPos.x + this.radius, 0, s.cellsPerSide.w - 1);
                for (col; col <= colLim; col++) {
                    let row = constrain(cellPos.y - this.radius, 0, s.cellsPerSide.h - 1);
                    const rowLim = constrain(cellPos.y + this.radius, 0, s.cellsPerSide.h - 1);
                    for (row; row <= rowLim; row++) {
                        const pos = createVector(col, row);
                        if (!s.isCellPosOccupied(pos)) {
                            s.addCell(
                                new Cell({
                                    cellPos: pos,
                                    weight: s.currentCellWeight,
                                    color: s.currentPalleteColor,
                                }),
                                pos
                            );
                        }
                    }
                }
                break;
            default:
                logError('not impl', { throwErr: true });
        }
    }
}