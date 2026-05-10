import type {PixelDimensions, WorldGenerationConstants} from "../types"

export const appDimensions: PixelDimensions = {
    width: 1600,
    height: 800,
}

export const gridViewDimensions: PixelDimensions = {
    width: 600,
    height: 600,
}

export const mainDisplayDimensions: PixelDimensions = {
    width: appDimensions.width - gridViewDimensions.width,
    height: appDimensions.height,
}

export const cellDimensions: PixelDimensions = {
    width: 100,
    height: 100,
}

export const playerConfig = {
    radius: 40,
    horizontalSpeed: 1000,
    verticalSpeed: 1000,
    gravity: 1000,
    maxFallSpeed: 2000,
}

export const cameraConfig = {
    minZoom: 0.5,
    maxZoom: 3,
    zoomStep: 0.1,
}

export const initialWorldSettings = {
    gridWidth: 20,
    gridHeight: 10,
}

export const worldGenerationConstants: WorldGenerationConstants = {
    layers: 5,
    roundingTargets: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
}
