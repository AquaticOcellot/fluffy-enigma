import * as PIXI from "pixi.js"
import {getGridDimensions} from "../grid/grid"
import type {PixelDimensions, World} from "../types"
import {baseTexture, earthTint} from "./renderConstants"
import {cellDimensions} from "../config/initialSettings";

export type WorldRenderer = {
    render: (world: World) => void
    destroy: () => void
}

export type WorldRendererOptions = {
    cellDimensions: PixelDimensions
}

export const createWorldRenderer = (
    parent: PIXI.Container,
    options: WorldRendererOptions
): WorldRenderer => {
    let container: PIXI.Container | null = null

    return {
        render: (world) => {
            container?.destroy({children: true})
            container = new PIXI.Container()
            parent.addChildAt(container, 0)

            const {gridWidth, gridHeight} = getGridDimensions(world.grid)

            container.addChild(new PIXI.Sprite({
                texture: baseTexture,
                x: 0,
                y: -20 * cellDimensions.height,
                width: gridWidth * cellDimensions.width,
                height: (gridHeight + 20) * cellDimensions.height,
                tint: "#000000",
            }))

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    container.addChild(new PIXI.Sprite({
                        x: x * options.cellDimensions.width,
                        y: y * options.cellDimensions.height,
                        width: options.cellDimensions.width,
                        height: options.cellDimensions.height,
                        texture: baseTexture,
                        alpha: world.grid[y][x],
                        tint: earthTint,
                    }))
                }
            }
        },
        destroy: () => {
            container?.destroy({children: true})
            container = null
        },
    }
}
