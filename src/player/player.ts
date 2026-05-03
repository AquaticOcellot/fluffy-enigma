import {playerConfig} from "../config/initialSettings"
import type {Vector2} from "../types"

export type PlayerState = {
    position: Vector2
}

export const createPlayerState = (): PlayerState => ({
    position: {x: 0, y: 0},
})

export const resetPlayer = (player: PlayerState) => {
    player.position.x = 0
    player.position.y = 0
}

export const updatePlayerMovement = (
    player: PlayerState,
    movement: Vector2,
    deltaSeconds: number
) => {
    if (movement.x === 0 && movement.y === 0) {
        return false
    }

    const magnitude = Math.hypot(movement.x, movement.y)
    player.position.x += movement.x / magnitude * playerConfig.speed * deltaSeconds
    player.position.y += movement.y / magnitude * playerConfig.speed * deltaSeconds

    return true
}

