import * as PIXI from "pixi.js"
import {getGridDimensions} from "../grid/grid"
import type {PixelDimensions, WorldRenderView} from "../types"
import {baseTexture, earthTint, rememberedTint, unknownTint} from "./renderConstants"
import {cellDimensions} from "../config/initialSettings";
import {isCellVisible} from "../world/vision"

export type WorldRenderer = {
    render: (view: WorldRenderView) => void
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
        render: (view) => {
            container?.destroy({children: true})
            container = new PIXI.Container()
            parent.addChildAt(container, 0)

            const {gridWidth, gridHeight} = getGridDimensions(view.world.grid)

            container.addChild(new PIXI.Sprite({
                texture: baseTexture,
                x: 0,
                y: -50 * cellDimensions.height,
                width: gridWidth * cellDimensions.width,
                height: (gridHeight + 50) * cellDimensions.height,
                tint: "#000000",
            }))

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const cellRenderState = getCellRenderState(view, x, y)

                    container.addChild(new PIXI.Sprite({
                        x: x * options.cellDimensions.width,
                        y: y * options.cellDimensions.height,
                        width: options.cellDimensions.width,
                        height: options.cellDimensions.height,
                        texture: baseTexture,
                        alpha: cellRenderState.alpha,
                        tint: cellRenderState.tint,
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

const getCellRenderState = (view: WorldRenderView, x: number, y: number) => {
    if (isCellVisible(x, y, view.playerPosition)) {
        return {
            alpha: view.world.grid[y][x],
            tint: earthTint,
        }
    }

    const rememberedValue = view.knowledge.memory[y][x]

    if (rememberedValue !== null) {
        return {
            alpha: rememberedValue,
            tint: rememberedTint,
        }
    }

    return {
        alpha: 1,
        tint: unknownTint,
    }
}
