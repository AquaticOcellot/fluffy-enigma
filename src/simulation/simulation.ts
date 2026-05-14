import {cellDimensions, playerConfig} from "../config/initialSettings"
import {getCell, getGridDimensions, setCell} from "../grid/grid"
import type {KeyboardInput} from "../input/keyboard"
import {movePlayerBy} from "../player/player"
import type {GameState} from "../state/gameState"
import type {Vector2} from "../types"
import {collidesWithSolidCell, collidesWithWorldBounds} from "../world/collision"
import {updateWorldKnowledge} from "../world/vision"

export const fixedTimeStep = 1 / 60
const maxFrameDelta = 0.25
const collisionSearchIterations = 8
const collisionTolerance = 1

export type GameUpdateResult = {
    playerMoved: boolean
    worldChanged: boolean
    visionChanged: boolean
}

export type FixedStepLoop = {
    update: (deltaSeconds: number) => GameUpdateResult
}

export const createFixedStepLoop = (
    step: (deltaSeconds: number) => GameUpdateResult,
    timeStep = fixedTimeStep
): FixedStepLoop => {
    let accumulator = 0

    return {
        update: (deltaSeconds) => {
            accumulator += Math.min(deltaSeconds, maxFrameDelta)
            let result = createGameUpdateResult()

            while (accumulator >= timeStep) {
                result = mergeGameUpdateResults(result, step(timeStep))
                accumulator -= timeStep
            }

            return result
        },
    }
}

export const updateGame = (
    gameState: GameState,
    input: KeyboardInput,
    deltaSeconds: number
) => {
    gameState.time += deltaSeconds

    if (gameState.player.drilling) {
        return updateKnowledgeAfterUpdate(gameState, updateDrilling(gameState, deltaSeconds))
    }

    gameState.player.velocity.y = Math.min(
        gameState.player.velocity.y + playerConfig.gravity * deltaSeconds,
        playerConfig.maxFallSpeed
    )

    const movement = input.movement()
    const delta = {
        x: movement.x * playerConfig.horizontalSpeed * deltaSeconds,
        y: (gameState.player.velocity.y + movement.y * playerConfig.verticalSpeed) * deltaSeconds,
    }

    return updateKnowledgeAfterUpdate(
        gameState,
        movePlayerWithCollision(gameState, delta, movement, input.drilling())
    )
}

const updateKnowledgeAfterUpdate = (
    gameState: GameState,
    result: GameUpdateResult
): GameUpdateResult => ({
    ...result,
    visionChanged: updateWorldKnowledge(gameState.world, gameState.knowledge, gameState.player.position),
})

const updateDrilling = (gameState: GameState, deltaSeconds: number): GameUpdateResult => {
    const drill = gameState.player.drilling

    if (!drill) {
        return createGameUpdateResult()
    }

    drill.elapsed = Math.min(drill.elapsed + deltaSeconds, drill.duration)
    const progress = drill.elapsed / drill.duration
    gameState.player.position.x = lerp(drill.startPosition.x, drill.targetPosition.x, progress)
    gameState.player.position.y = lerp(drill.startPosition.y, drill.targetPosition.y, progress)

    if (drill.elapsed < drill.duration) {
        return {playerMoved: true, worldChanged: false, visionChanged: false}
    }

    setCell(gameState.world.grid, drill.targetCell.x, drill.targetCell.y, 0)
    gameState.player.fuel -= drill.fuelCost
    gameState.player.velocity.x = 0
    gameState.player.velocity.y = 0
    gameState.player.drilling = null

    return {playerMoved: true, worldChanged: true, visionChanged: false}
}

const movePlayerWithCollision = (
    gameState: GameState,
    delta: Vector2,
    movement: Vector2,
    drilling: boolean
): GameUpdateResult => {
    const update = createGameUpdateResult()

    const tryMove = (axisDelta: Vector2, canDrill: boolean) => {
        const result = getSafeMovementDelta(gameState, axisDelta)

        if (result.delta.x !== 0 || result.delta.y !== 0) {
            movePlayerBy(gameState.player, result.delta)
            update.playerMoved = true
        }

        if (axisDelta.y !== 0 && result.blocked) {
            gameState.player.velocity.y = 0
        }

        if (result.blocked && canDrill) {
            startDrilling(gameState, axisDelta)
        }
    }

    if (delta.x !== 0) {
        tryMove({x: delta.x, y: 0}, drilling && movement.x !== 0)
        if (gameState.player.drilling) {
            return update
        }
    }

    if (delta.y !== 0) {
        tryMove({x: 0, y: delta.y}, drilling && movement.y !== 0)
    }

    return update
}

const startDrilling = (gameState: GameState, axisDelta: Vector2) => {
    if (gameState.player.drilling || gameState.player.fuel <= 0) {
        return
    }

    const targetCell = findDrillTargetCell(gameState, axisDelta)

    if (!targetCell || targetCell.value > gameState.player.fuel) {
        return
    }

    gameState.player.velocity.x = 0
    gameState.player.velocity.y = 0
    gameState.player.drilling = {
        startPosition: {...gameState.player.position},
        targetPosition: getCellCenter(targetCell),
        targetCell: {x: targetCell.x, y: targetCell.y},
        elapsed: 0,
        duration: playerConfig.drillDuration,
        fuelCost: targetCell.value,
    }
}

const findDrillTargetCell = (gameState: GameState, axisDelta: Vector2) => {
    const {gridWidth, gridHeight} = getGridDimensions(gameState.world.grid)
    const probePosition = getDrillProbePosition(gameState.player.position, axisDelta)
    const x = Math.floor(probePosition.x / cellDimensions.width)
    const y = Math.floor(probePosition.y / cellDimensions.height)

    if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) {
        return null
    }

    const value = getCell(gameState.world.grid, x, y) ?? 0

    if (value === 0) {
        return null
    }

    return {x, y, value}
}

const getDrillProbePosition = (position: Vector2, axisDelta: Vector2): Vector2 => {
    if (axisDelta.x > 0) {
        return {x: position.x + playerConfig.radius + 1, y: position.y}
    }

    if (axisDelta.x < 0) {
        return {x: position.x - playerConfig.radius - 1, y: position.y}
    }

    if (axisDelta.y > 0) {
        return {x: position.x, y: position.y + playerConfig.radius + 1}
    }

    return {x: position.x, y: position.y - playerConfig.radius - 1}
}

const getCellCenter = (cell: Vector2): Vector2 => ({
    x: (cell.x + 0.5) * cellDimensions.width,
    y: (cell.y + 0.5) * cellDimensions.height,
})

type SafeMovementResult = {
    delta: Vector2
    blocked: boolean
}

const getSafeMovementDelta = (gameState: GameState, axisDelta: Vector2): SafeMovementResult => {
    if (!wouldCollideAtOffset(gameState, axisDelta)) {
        return {delta: axisDelta, blocked: false}
    }

    let low = 0
    let high = 1

    for (let i = 0; i < collisionSearchIterations; i++) {
        const mid = (low + high) / 2
        const testDelta = scaleVector(axisDelta, mid)

        if (wouldCollideAtOffset(gameState, testDelta)) {
            high = mid
        } else {
            low = mid
        }
    }

    return {delta: scaleVector(axisDelta, low), blocked: true}
}

const wouldCollideAtOffset = (gameState: GameState, offset: Vector2) => {
    const circle = {
        position: {
            x: gameState.player.position.x + offset.x,
            y: gameState.player.position.y + offset.y,
        },
        radius: playerConfig.radius,
        tolerance: collisionTolerance,
    }

    return collidesWithWorldBounds(gameState.world, cellDimensions, circle)
        || collidesWithSolidCell(gameState.world, cellDimensions, circle)
}

const scaleVector = (vector: Vector2, scale: number): Vector2 => ({
    x: vector.x * scale,
    y: vector.y * scale,
})

const lerp = (start: number, end: number, progress: number) => {
    return start + (end - start) * progress
}

const createGameUpdateResult = (): GameUpdateResult => ({
    playerMoved: false,
    worldChanged: false,
    visionChanged: false,
})

const mergeGameUpdateResults = (
    first: GameUpdateResult,
    second: GameUpdateResult
): GameUpdateResult => ({
    playerMoved: first.playerMoved || second.playerMoved,
    worldChanged: first.worldChanged || second.worldChanged,
    visionChanged: first.visionChanged || second.visionChanged,
})
