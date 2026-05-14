import type {PlayerState} from "../player/player"
import {createPlayerState, resetPlayer} from "../player/player"
import type {WorldConfig, World, WorldKnowledge} from "../types"
import {createWorld} from "../world/world"
import {createWorldKnowledge} from "../world/vision"

export type GameState = {
    world: World
    knowledge: WorldKnowledge
    player: PlayerState
    time: number
}

export const createGameState = (config: WorldConfig): GameState => {
    const world = createWorld(config)
    const player = createPlayerState()

    return {
        world,
        knowledge: createWorldKnowledge(world, player.position),
        player,
        time: 0,
    }
}

export const regenerateWorld = (gameState: GameState, config: WorldConfig) => {
    gameState.world = createWorld(config)
    gameState.time = 0
    resetPlayer(gameState.player)
    gameState.knowledge = createWorldKnowledge(gameState.world, gameState.player.position)
}
