import type {Vector2} from "../types"

export type PlayerState = {
    position: Vector2
    velocity: Vector2
}

export const createPlayerState = (): PlayerState => ({
    position: {x: 50, y: 50},
    velocity: {x: 0, y: 0},
})

export const resetPlayer = (player: PlayerState) => {
    player.position.x = 50
    player.position.y = 50
    player.velocity.x = 0
    player.velocity.y = 0
}

export const movePlayerBy = (player: PlayerState, delta: Vector2) => {
    player.position.x += delta.x
    player.position.y += delta.y
}
