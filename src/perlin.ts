import {createNoise2D} from "simplex-noise"

const noise = createNoise2D()

export const Perlin = (
    dimensions: number[],
    layer_number: number
): number[][] => {
    let values: number[][] = []
    let layer_offsets: number[][] = []
    for (let layer_index = 0; layer_index < layer_number; layer_index++) {
        layer_offsets.push([Math.random() * 1000, Math.random() * 1000])
    }
    for (let row_index = 0; row_index < dimensions[1]; row_index++) {
        const row: number[] = []
        for (let col_index = 0; col_index < dimensions[0]; col_index++) {
            let value = 0
            for (let layer_index = 0; layer_index < layer_number; layer_index++) {
                value = value + noise(
                    col_index / 400 * 2 ** layer_index + layer_offsets[layer_index][0],
                    row_index / 400 * 2 ** layer_index + layer_offsets[layer_index][1]
                ) * 0.5 + 0.5
            }
            value = value / layer_number
            row.push(value)
        }
        values.push(row)
    }

    return values
}