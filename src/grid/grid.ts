import type {Grid} from "../types"

export type CellVisitor = (value: number, x: number, y: number) => void
export type CellMapper = (value: number, x: number, y: number) => number

export const createGrid = <T = number>(
    gridWidth: number,
    gridHeight: number,
    getValue: (x: number, y: number) => T = (() => 0) as (x: number, y: number) => T
): T[][] => {
    const grid: T[][] = []

    for (let y = 0; y < gridHeight; y++) {
        const row: T[] = []

        for (let x = 0; x < gridWidth; x++) {
            row.push(getValue(x, y))
        }

        grid.push(row)
    }

    return grid
}

export const getGridDimensions = (grid: Grid) => ({
    gridWidth: grid[0]?.length ?? 0,
    gridHeight: grid.length,
})

export const getCell = (grid: Grid, x: number, y: number) => grid[y]?.[x]

export const setCell = (grid: Grid, x: number, y: number, value: number) => {
    grid[y][x] = value
}

export const forEachCell = (grid: Grid, visitor: CellVisitor) => {
    const {gridWidth, gridHeight} = getGridDimensions(grid)

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            visitor(grid[y][x], x, y)
        }
    }
}

export const mapGrid = (grid: Grid, mapper: CellMapper): Grid => {
    const {gridWidth, gridHeight} = getGridDimensions(grid)

    return createGrid<number>(gridWidth, gridHeight, (x, y) => mapper(grid[y][x], x, y))
}

export const maxCellValue = (grid: Grid) => {
    let maxValue = 0

    forEachCell(grid, (value) => {
        maxValue = Math.max(maxValue, value)
    })

    return maxValue
}

export const minCellValue = (grid: Grid) => {
    let minValue = Infinity

    forEachCell(grid, (value) => {
        minValue = Math.min(minValue, value)
    })

    return minValue
}
