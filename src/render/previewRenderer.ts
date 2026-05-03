import * as PIXI from "pixi.js"
import {gridViewDimensions} from "../config/initialSettings"
import {getGridDimensions} from "../grid/grid"
import type {Grid} from "../types"
import type {UIContainer} from "../ui"
import {baseTexture} from "./renderConstants"

export type PreviewRenderer = {
    render: (grid: Grid) => void
    destroy: () => void
}

export const createPreviewRenderer = (ui: UIContainer): PreviewRenderer => {
    let container: PIXI.Container | null = null

    return {
        render: (grid) => {
            container?.destroy({children: true})
            container = new PIXI.Container()
            ui.addChildAt(container, 0)

            const {gridWidth, gridHeight} = getGridDimensions(grid)
            const cellSize = Math.min(
                gridViewDimensions.width / gridWidth,
                gridViewDimensions.height / gridHeight,
            )

            container.scale.set(cellSize)

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const cellSprite = new PIXI.Sprite({
                        x,
                        y,
                        texture: baseTexture,
                        alpha: grid[y][x],
                    })

                    cellSprite.eventMode = "static"
                    cellSprite.on("pointerenter", () => {
                        cellSprite.tint = 0xff0000
                        ui.setHoverInfo(
                            `Cell at [${x}, ${y}]\nCost: ${grid[y][x].toFixed(8)}`,
                            {x: x * cellSize, y: y * cellSize},
                            cellSize
                        )
                    })
                    cellSprite.on("pointerleave", () => {
                        cellSprite.tint = 0xffffff
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

