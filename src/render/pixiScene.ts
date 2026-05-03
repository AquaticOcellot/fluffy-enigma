import * as PIXI from "pixi.js"
import {appDimensions, cellDimensions, mainDisplayDimensions} from "../config/initialSettings"
import type {Grid, Vector2, World} from "../types"
import type {UIContainer} from "../ui"
import {createCamera} from "./camera"
import {createPlayerGraphic, renderPlayer} from "./playerRenderer"
import {createPreviewRenderer, type PreviewRenderer} from "./previewRenderer"
import {baseTexture} from "./renderConstants"
import {createWorldRenderer, type WorldRenderer} from "./worldRenderer"

export type PixiScene = {
    app: PIXI.Application
    init: (container: HTMLElement, ui: UIContainer) => Promise<void>
    destroy: () => void
    renderWorld: (world: World) => void
    renderPreview: (grid: Grid) => void
    setPlayerPosition: (position: Vector2) => void
    applyZoomFromWheel: (event: WheelEvent) => void
}

export const createPixiScene = (): PixiScene => {
    const app = new PIXI.Application()
    const worldViewport = new PIXI.Container()
    const worldCamera = new PIXI.Container()
    const camera = createCamera(worldCamera)
    const playerGraphic = createPlayerGraphic()

    let worldRenderer: WorldRenderer | null = null
    let previewRenderer: PreviewRenderer | null = null

    const scaleApp = () => {
        const scale = Math.min(
            window.innerHeight / appDimensions.height,
            window.innerWidth / appDimensions.width
        )
        app.stage.scale.set(scale, scale)
        app.renderer.resize(appDimensions.width * scale, appDimensions.height * scale)
    }

    return {
        app,
        init: async (container, ui) => {
            await app.init({width: appDimensions.width, height: appDimensions.height})
            container.appendChild(app.canvas)

            app.stage.addChild(new PIXI.Sprite({
                texture: baseTexture,
                x: 0,
                y: 0,
                width: mainDisplayDimensions.width,
                height: mainDisplayDimensions.height,
                tint: "0x111111",
            }))

            worldViewport.addChild(worldCamera)
            app.stage.addChild(worldViewport)

            const worldMask = new PIXI.Graphics()
            worldMask.rect(0, 0, mainDisplayDimensions.width, mainDisplayDimensions.height).fill(0xffffff)
            worldViewport.mask = worldMask
            app.stage.addChild(worldMask)

            worldCamera.addChild(playerGraphic)
            worldRenderer = createWorldRenderer(worldCamera, {cellDimensions})
            previewRenderer = createPreviewRenderer(ui)

            scaleApp()
            window.addEventListener("resize", scaleApp)

            ui.position.set(mainDisplayDimensions.width, 0)
            app.stage.addChild(ui)
        },
        destroy: () => {
            window.removeEventListener("resize", scaleApp)
            worldRenderer?.destroy()
            previewRenderer?.destroy()
            app.destroy(true)
        },
        renderWorld: (world) => {
            worldRenderer?.render(world)
        },
        renderPreview: (grid) => {
            previewRenderer?.render(grid)
        },
        setPlayerPosition: (position) => {
            renderPlayer(playerGraphic, position)
            camera.update(position)
        },
        applyZoomFromWheel: (event) => {
            if (app.canvas) {
                camera.applyZoomFromWheel(event, app.canvas, app.stage.scale.x)
            }
        },
    }
}
