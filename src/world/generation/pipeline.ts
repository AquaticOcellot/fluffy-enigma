import {mapGrid, maxCellValue, minCellValue} from "../../grid/grid"
import type {Grid, WorldConfig} from "../../types"
import {generatePerlinGrid} from "./perlin"

export type WorldGenerator = (context: WorldConfig) => Grid
export type WorldGenerationPass = (grid: Grid, context: WorldConfig) => Grid

export type WorldGenerationPipeline = {
    base: WorldGenerator
    passes: WorldGenerationPass[]
}

export const runWorldGenerationPipeline = (
    pipeline: WorldGenerationPipeline,
    worldSettings: WorldConfig
) => {
    return pipeline.passes.reduce(
        (grid, pass) => pass(grid, worldSettings),
        pipeline.base(worldSettings)
    )
}

export const normalize: WorldGenerationPass = (grid) => {
    const minValue = minCellValue(grid)
    grid = mapGrid(grid, (value) => value - minValue)

    const maxValue = maxCellValue(grid)
    if (maxValue === 0) {return grid}
    return mapGrid(grid, (value) => value / maxValue)
}

export const round: WorldGenerationPass = (grid, context) => {
    const nearestTarget = (value: number, targets: number[])=> {
        let low = 0
        let high = targets.length - 1
        let mid: number
        while (low < high) {
            mid = Math.floor((low + high) / 2)
            if (value >= targets[mid]) {low = mid + 1}
            else {high = mid}
        }
        const lower = Math.max(low - 1, 0)
        return Math.abs(value - targets[lower]) <= Math.abs(value - targets[low]) ? targets[lower] : targets[low]
    }
    const targets = context.roundingTargets
    return mapGrid(grid, (value) => {
        return nearestTarget(value, targets)
    })
}

export const createDefaultWorldGenerationPipeline = (settings: WorldConfig): WorldGenerationPipeline => ({
    base: () => generatePerlinGrid(settings.gridWidth, settings.gridHeight, settings.layers),
    passes: [
        normalize,
        round,
    ],
})

