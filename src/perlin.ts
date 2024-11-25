import {createNoise2D} from "simplex-noise"

const noise = createNoise2D()
const amplitudeDelta = 1.15

export const Perlin = (
    dimensions: number[],
    layer_number: number
): number[][] => {
    let values: number[][] = []
    let layer_offsets: number[][] = []
    for (let layer_index = 0; layer_index < layer_number; layer_index++) {
        layer_offsets.push([Math.random() * 1000, Math.random() * 1000])
    }
    let max_value = 0
    for (let row_index = 0; row_index < dimensions[1]; row_index++) {
        const row: number[] = []
        for (let col_index = 0; col_index < dimensions[0]; col_index++) {
            let value = 0
            for (let layer_index = 0; layer_index < layer_number; layer_index++) {
                value += amplitudeDelta ** layer_index * (noise(
                    col_index / 400 * 2 ** layer_index + layer_offsets[layer_index][0],
                    row_index / 400 * 2 ** layer_index + layer_offsets[layer_index][1]
                ) * 0.5 + 0.5)
            }
            max_value = Math.max(max_value, value)
            row.push(value)
        }
        values.push(row)
    }

    for (let row_index = 0; row_index < dimensions[1]; row_index++) {
        for (let col_index = 0; col_index < dimensions[0]; col_index++) {
            values[row_index][col_index]  /= max_value
        }
    }

    return values
}