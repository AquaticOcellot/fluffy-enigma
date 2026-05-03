import * as PIXI from "pixi.js"
import {cameraConfig, mainDisplayDimensions} from "../config/initialSettings"
import type {Vector2} from "../types"

export type Camera = {
    update: (target: Vector2) => void
    applyZoomFromWheel: (event: WheelEvent, canvas: HTMLCanvasElement, stageScale: number) => void
}

export const createCamera = (cameraContainer: PIXI.Container): Camera => {
    let zoom = 1
    let targetPosition: Vector2 = {x: 0, y: 0}

    const update = (target: Vector2) => {
        targetPosition = target
        cameraContainer.scale.set(zoom)
        cameraContainer.position.set(
            mainDisplayDimensions.width / 2 - targetPosition.x * zoom,
            mainDisplayDimensions.height / 2 - targetPosition.y * zoom
        )
    }

    return {
        update,
        applyZoomFromWheel: (event, canvas, stageScale) => {
            const rect = canvas.getBoundingClientRect()
            const pointerX = event.clientX - rect.left
            const pointerY = event.clientY - rect.top
            const viewportWidth = mainDisplayDimensions.width * stageScale
            const viewportHeight = mainDisplayDimensions.height * stageScale

            if (pointerX < 0 || pointerY < 0 || pointerX > viewportWidth || pointerY > viewportHeight) {
                return
            }

            event.preventDefault()
            const direction = Math.sign(event.deltaY)
            const nextZoom = Math.min(
                Math.max(zoom - direction * cameraConfig.zoomStep, cameraConfig.minZoom),
                cameraConfig.maxZoom
            )

            if (nextZoom !== zoom) {
                zoom = nextZoom
                update(targetPosition)
            }
        },
    }
}

