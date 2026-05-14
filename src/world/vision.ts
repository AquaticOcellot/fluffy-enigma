import {cellDimensions, playerConfig} from "../config/initialSettings"
import {createGrid, getGridDimensions} from "../grid/grid"
import type {Vector2, World, WorldKnowledge} from "../types"

export const createWorldKnowledge = (world: World, playerPosition: Vector2): WorldKnowledge => {
    const {gridWidth, gridHeight} = getGridDimensions(world.grid)
    const knowledge = {
        memory: createGrid<number | null>(gridWidth, gridHeight, () => null),
    }

    updateWorldKnowledge(world, knowledge, playerPosition)

    return knowledge
}

export const updateWorldKnowledge = (
    world: World,
    knowledge: WorldKnowledge,
    playerPosition: Vector2
) => {
    let changed = false
    const {gridWidth, gridHeight} = getGridDimensions(world.grid)

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (!isCellVisible(x, y, playerPosition)) {
                continue
            }

            const value = world.grid[y][x]

            if (knowledge.memory[y][x] !== value) {
                knowledge.memory[y][x] = value
                changed = true
            }
        }
    }

    return changed
}

export const isCellVisible = (
    cellX: number,
    cellY: number,
    playerPosition: Vector2
) => {
    const center = getCellCenter(cellX, cellY)
    const playerCellCenter = getPlayerCellCenter(playerPosition)
    const distanceX = center.x - playerCellCenter.x
    const distanceY = center.y - playerCellCenter.y

    return distanceX * distanceX + distanceY * distanceY <= playerConfig.visionRange * playerConfig.visionRange
}

export const getCellCenter = (cellX: number, cellY: number): Vector2 => ({
    x: (cellX + 0.5) * cellDimensions.width,
    y: (cellY + 0.5) * cellDimensions.height,
})

const getPlayerCellCenter = (playerPosition: Vector2): Vector2 => {
    return getCellCenter(
        Math.floor(playerPosition.x / cellDimensions.width),
        Math.floor(playerPosition.y / cellDimensions.height)
    )
}
