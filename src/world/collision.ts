import {getCell, getGridDimensions} from "../grid/grid"
import type {PixelDimensions, Vector2, World} from "../types"

export type CircleCollision = {
    position: Vector2
    radius: number
    tolerance?: number
}

export type SolidCellCollision = {
    x: number
    y: number
    value: number
}

export const collidesWithSolidCell = (
    world: World,
    cellDimensions: PixelDimensions,
    circle: CircleCollision
) => {
    return findSolidCellCollision(world, cellDimensions, circle) !== null
}

export const findSolidCellCollision = (
    world: World,
    cellDimensions: PixelDimensions,
    circle: CircleCollision
): SolidCellCollision | null => {
    const {gridWidth, gridHeight} = getGridDimensions(world.grid)
    const radius = getCollisionRadius(circle)
    const minCellX = worldToCellIndex(circle.position.x - radius, cellDimensions.width)
    const maxCellX = worldToCellIndex(circle.position.x + radius, cellDimensions.width)
    const minCellY = worldToCellIndex(circle.position.y - radius, cellDimensions.height)
    const maxCellY = worldToCellIndex(circle.position.y + radius, cellDimensions.height)

    for (let y = minCellY; y <= maxCellY; y++) {
        for (let x = minCellX; x <= maxCellX; x++) {
            if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) {
                continue
            }

            if ((getCell(world.grid, x, y) ?? 0) === 0) {
                continue
            }

            if (circleIntersectsCell(circle, x, y, cellDimensions)) {
                return {x, y, value: getCell(world.grid, x, y) ?? 0}
            }
        }
    }

    return null
}

export const collidesWithWorldBounds = (
    world: World,
    cellDimensions: PixelDimensions,
    circle: CircleCollision
) => {
    const {gridWidth, gridHeight} = getGridDimensions(world.grid)
    const left = 0
    const right = gridWidth * cellDimensions.width
    const bottom = gridHeight * cellDimensions.height
    const radius = getCollisionRadius(circle)

    return circle.position.x - radius < left
        || circle.position.x + radius > right
        || circle.position.y + radius > bottom
}

const worldToCellIndex = (position: number, cellSize: number) => {
    return Math.floor(position / cellSize)
}

const circleIntersectsCell = (
    circle: CircleCollision,
    cellX: number,
    cellY: number,
    cellDimensions: PixelDimensions
) => {
    const radius = getCollisionRadius(circle)
    const minX = cellX * cellDimensions.width
    const maxX = minX + cellDimensions.width
    const minY = cellY * cellDimensions.height
    const maxY = minY + cellDimensions.height
    const closestX = clamp(circle.position.x, minX, maxX)
    const closestY = clamp(circle.position.y, minY, maxY)
    const distanceX = circle.position.x - closestX
    const distanceY = circle.position.y - closestY

    return distanceX * distanceX + distanceY * distanceY < radius * radius
}

const getCollisionRadius = (circle: CircleCollision) => {
    return Math.max(circle.radius - (circle.tolerance ?? 0), 0)
}

const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max)
}
