import {createNoise2D} from "simplex-noise"
import {createGrid} from "../../grid/grid"

const amplitudeDelta = 1.15

export const generatePerlinGrid = (gridWidth: number, gridHeight: number, layers: number): Grid => {
    const noise = createNoise2D()
    const layerOffsets: number[][] = []

    for (let layerIndex = 0; layerIndex < layers; layerIndex++) {
        layerOffsets.push([Math.random() * 1000, Math.random() * 1000])
    }

    return createGrid(gridWidth, gridHeight, (x, y) => {
        let value = 0

        for (let layerIndex = 0; layerIndex < layers; layerIndex++) {
            value += amplitudeDelta ** layerIndex * (noise(
                x / 400 * 2 ** layerIndex + layerOffsets[layerIndex][0],
                y / 400 * 2 ** layerIndex + layerOffsets[layerIndex][1]
            ) * 0.5 + 0.5)
        }

        return value
    })
}
