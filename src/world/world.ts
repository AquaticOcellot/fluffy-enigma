import type {World, WorldConfig} from "../types"
import {createDefaultWorldGenerationPipeline, runWorldGenerationPipeline} from "./generation/pipeline"

export const createWorld = (config: WorldConfig): World => {
    const pipeline = createDefaultWorldGenerationPipeline(config)
    const grid = runWorldGenerationPipeline(pipeline, config)

    return {
        grid,
    }
}
