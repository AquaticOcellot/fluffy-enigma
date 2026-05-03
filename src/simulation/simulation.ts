import type {KeyboardInput} from "../input/keyboard"
import {updatePlayerMovement} from "../player/player"
import type {GameState} from "../state/gameState"

export const fixedTimeStep = 1 / 60
const maxFrameDelta = 0.25

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

    return updatePlayerMovement(
        gameState.player,
        input.movement(),
        deltaSeconds
    )
}

