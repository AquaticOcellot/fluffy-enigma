import type {PlayerState} from "../player/player"
import {createPlayerState, resetPlayer} from "../player/player"
import type {WorldConfig, World} from "../types"
import {createWorld} from "../world/world"

export type GameState = {
    world: World
    player: PlayerState
    time: number
}

export const createGameState = (config: WorldConfig): GameState => ({
    world: createWorld(config),
    player: createPlayerState(),
    time: 0,
})

export const regenerateWorld = (gameState: GameState, config: WorldConfig) => {
    gameState.world = createWorld(config)
    gameState.time = 0
    resetPlayer(gameState.player)
}

