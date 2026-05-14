import {playerConfig} from "../config/initialSettings"
import type {Vector2} from "../types"

export type DrillState = {
    startPosition: Vector2
    targetPosition: Vector2
    targetCell: Vector2
    elapsed: number
    duration: number
    fuelCost: number
}

export type PlayerState = {
    position: Vector2
    velocity: Vector2
    fuel: number
    drilling: DrillState | null
}

export const createPlayerState = (): PlayerState => ({
    position: {x: 50, y: 50},
    velocity: {x: 0, y: 0},
    fuel: playerConfig.maxFuel,
    drilling: null,
})

export const resetPlayer = (player: PlayerState) => {
    player.position.x = 50
    player.position.y = 50
    player.velocity.x = 0
    player.velocity.y = 0
    player.fuel = playerConfig.maxFuel
    player.drilling = null
}

export const movePlayerBy = (player: PlayerState, delta: Vector2) => {
    player.position.x += delta.x
    player.position.y += delta.y
}
