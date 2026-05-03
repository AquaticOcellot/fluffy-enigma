import * as PIXI from "pixi.js"
import {getGridDimensions} from "../grid/grid"
import type {PixelDimensions, World} from "../types"
import {baseTexture} from "./renderConstants"

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

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    container.addChild(new PIXI.Sprite({
                        x: x * options.cellDimensions.width - options.cellDimensions.width / 2,
                        y: y * options.cellDimensions.height - options.cellDimensions.height / 2,
                        width: options.cellDimensions.width,
                        height: options.cellDimensions.height,
                        texture: baseTexture,
                        alpha: world.grid[y][x],
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
