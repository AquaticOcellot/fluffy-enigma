import {initialWorldSettings, worldGenerationConstants} from "../config/initialSettings"
import type {WorldConfig, WorldSettings} from "../types"

export const worldSettings: WorldSettings = {...initialWorldSettings}
export const worldConfig: WorldConfig = {...initialWorldSettings, ...worldGenerationConstants}

export const setSetting = (id: keyof WorldSettings, value: number) => {
    worldConfig[id] = value
}

