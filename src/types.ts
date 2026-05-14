export type Vector2 = {
    x: number
    y: number
}

export type PixelDimensions = {
    width: number
    height: number
}

export type WorldGenerationConstants = {
    layers: number
    roundingTargets: number[]
}

export type WorldSettings = {
    gridWidth: number
    gridHeight: number
}

export type WorldConfig = WorldGenerationConstants & WorldSettings

export type Grid = number[][]
export type MemoryGrid = (number | null)[][]

export type World = {
    grid: Grid
}

export type WorldKnowledge = {
    memory: MemoryGrid
}

export type WorldRenderView = {
    world: World
    knowledge: WorldKnowledge
    playerPosition: Vector2
}
