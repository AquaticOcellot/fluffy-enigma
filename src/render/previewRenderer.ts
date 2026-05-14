import * as PIXI from "pixi.js"
import {gridViewDimensions} from "../config/initialSettings"
import {getGridDimensions} from "../grid/grid"
import type {WorldRenderView} from "../types"
import type {UIContainer} from "../ui"
import {isCellVisible} from "../world/vision"
import {baseTexture, earthTint, rememberedTint, unknownTint} from "./renderConstants"

export type PreviewRenderer = {
    render: (view: WorldRenderView) => void
    destroy: () => void
}

export const createPreviewRenderer = (ui: UIContainer): PreviewRenderer => {
    let container: PIXI.Container | null = null

    return {
        render: (view) => {
            container?.destroy({children: true})
            container = new PIXI.Container()
            ui.addChildAt(container, 0)

            const {gridWidth, gridHeight} = getGridDimensions(view.world.grid)
            const cellSize = Math.min(
                gridViewDimensions.width / gridWidth,
                gridViewDimensions.height / gridHeight,
            )

            container.scale.set(cellSize)

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const cellRenderState = getPreviewCellRenderState(view, x, y)
                    const cellSprite = new PIXI.Sprite({
                        x,
                        y,
                        texture: baseTexture,
                        alpha: cellRenderState.alpha,
                        tint: cellRenderState.tint,
                    })

                    cellSprite.eventMode = "static"
                    cellSprite.on("pointerenter", () => {
                        cellSprite.tint = 0xff0000
                        ui.setHoverInfo(
                            getPreviewHoverText(view, x, y),
                            {x: x * cellSize, y: y * cellSize},
                            cellSize
                        )
                    })
                    cellSprite.on("pointerleave", () => {
                        cellSprite.tint = cellRenderState.tint
                        ui.clearHoverInfo()
                    })

                    container.addChild(cellSprite)
                }
            }
        },
        destroy: () => {
            container?.destroy({children: true})
            container = null
        },
    }
}

const getPreviewCellRenderState = (view: WorldRenderView, x: number, y: number) => {
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

const getPreviewHoverText = (view: WorldRenderView, x: number, y: number) => {
    if (isCellVisible(x, y, view.playerPosition)) {
        return `Cell at [${x}, ${y}]\nCost: ${view.world.grid[y][x].toFixed(8)}`
    }

    const rememberedValue = view.knowledge.memory[y][x]

    if (rememberedValue !== null) {
        return `Cell at [${x}, ${y}]\nRemembered cost: ${rememberedValue.toFixed(8)}`
    }

    return `Cell at [${x}, ${y}]\nUnknown`
}
