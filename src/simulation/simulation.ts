import {cellDimensions, playerConfig} from "../config/initialSettings"
import type {KeyboardInput} from "../input/keyboard"
import {movePlayerBy} from "../player/player"
import type {GameState} from "../state/gameState"
import type {Vector2} from "../types"
import {collidesWithSolidCell, collidesWithWorldBounds} from "../world/collision"

export const fixedTimeStep = 1 / 60
const maxFrameDelta = 0.25
const collisionSearchIterations = 8
const collisionTolerance = 1

export type FixedStepLoop = {
    update: (deltaSeconds: number) => boolean
}

export const createFixedStepLoop = (
    step: (deltaSeconds: number) => boolean,
    timeStep = fixedTimeStep
): FixedStepLoop => {
    let accumulator = 0

    return {
        update: (deltaSeconds) => {
            accumulator += Math.min(deltaSeconds, maxFrameDelta)
            let changed = false

            while (accumulator >= timeStep) {
                changed = step(timeStep) || changed
                accumulator -= timeStep
            }

            return changed
        },
    }
}

export const updateGame = (
    gameState: GameState,
    input: KeyboardInput,
    deltaSeconds: number
) => {
    gameState.time += deltaSeconds
    gameState.player.velocity.y = Math.min(
        gameState.player.velocity.y + playerConfig.gravity * deltaSeconds,
        playerConfig.maxFallSpeed
    )

    const movement = input.movement()
    const delta = {
        x: movement.x * playerConfig.horizontalSpeed * deltaSeconds,
        y: (gameState.player.velocity.y + movement.y * playerConfig.verticalSpeed) * deltaSeconds,
    }

    return movePlayerWithCollision(gameState, delta)
}

const movePlayerWithCollision = (gameState: GameState, delta: Vector2) => {
    let moved = false

    const tryMove = (axisDelta: Vector2) => {
        const result = getSafeMovementDelta(gameState, axisDelta)

        if (result.delta.x === 0 && result.delta.y === 0) {
            if (axisDelta.y !== 0 && result.blocked) {
                gameState.player.velocity.y = 0
            }
            return
        }

        movePlayerBy(gameState.player, result.delta)

        if (axisDelta.y !== 0 && result.blocked) {
            gameState.player.velocity.y = 0
        }

        moved = true
    }

    if (delta.x !== 0) {
        tryMove({x: delta.x, y: 0})
    }

    if (delta.y !== 0) {
        tryMove({x: 0, y: delta.y})
    }

    return moved
}

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
