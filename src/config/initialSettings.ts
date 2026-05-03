import type {PixelDimensions, WorldConstants} from "../types"

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

export const gridDimensions = {
    gridWidth: 20,
    gridHeight: 10,
}

export const playerConfig = {
    radius: 80,
    speed: 1000,
}

export const cameraConfig = {
    minZoom: 0.5,
    maxZoom: 3,
    zoomStep: 0.1,
}

export const worldConstants: WorldConstants = {
    layers: 5,
    roundingTargets: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
}

