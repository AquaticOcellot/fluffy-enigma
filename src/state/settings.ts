import {gridDimensions, worldConstants} from "../config/initialSettings"
import type {WorldConfig, WorldSettings} from "../types"

export const worldSettings: WorldSettings = {...gridDimensions}
export const worldConfig: WorldConfig = {...gridDimensions, ...worldConstants}

export const setSetting = (id: keyof WorldSettings, value: number) => {
    worldConfig[id] = value
}

