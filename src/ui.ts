import * as PIXI from "pixi.js"
import {gridViewDimensions} from "./config/initialSettings"
import {worldSettings} from "./state/settings"
import type {WorldSettings, Vector2} from "./types"

const overlayPadding = 10
const hoverInfoWidth = 200
const textStyle = new PIXI.TextStyle({
    fill: "#ffffff",
    fontSize: 20,
    wordWrap: true,
    breakWords: true,
    wordWrapWidth: hoverInfoWidth - overlayPadding * 2,
})
const dimensionSliderDimensions = {width: gridViewDimensions.width, height: 50}

export type UIContainer = PIXI.Container & {
    setHoverInfo: (text: string, cellPosition: Vector2 | null, cellSize: number) => void
    clearHoverInfo: () => void
}

export type UIOptions = {
    onGenerateWorld: () => void
    onSettingChange: (id: keyof WorldSettings, value: number) => void
}

export const createUI = (options: UIOptions) => {
    const UI = new PIXI.Container() as UIContainer
    const hoverInfo = new PIXI.Container()
    const hoverBackground = new PIXI.Sprite({
        texture: PIXI.Texture.WHITE,
        tint: "0x000000",
        alpha: 0.6,
    })
    const hoverText = new PIXI.Text({
        text: "",
        style: textStyle,
    })

    hoverInfo.addChild(hoverBackground)
    hoverInfo.addChild(hoverText)
    hoverInfo.visible = false
    UI.addChild(hoverInfo)

    const layoutHoverInfo = (alignRight: boolean, panelWidth: number, panelHeight: number) => {
        hoverText.position.set(overlayPadding, overlayPadding)
        hoverBackground.width = panelWidth
        hoverBackground.height = panelHeight
        hoverInfo.position.set(
            alignRight ? gridViewDimensions.width - panelWidth : 0,
            0
        )
    }

    UI.setHoverInfo = (text: string, cellPosition: Vector2 | null, cellSize: number) => {
        hoverText.text = text
        const panelWidth = hoverInfoWidth
        const panelHeight = hoverText.height + overlayPadding * 2
        const intersectsTopLeft = cellPosition !== null
            && cellPosition.x < panelWidth
            && cellPosition.y < panelHeight
            && cellPosition.x + cellSize > 0
            && cellPosition.y + cellSize > 0
        layoutHoverInfo(intersectsTopLeft, panelWidth, panelHeight)
        hoverInfo.visible = true
    }

    UI.clearHoverInfo = () => {
        hoverInfo.visible = false
    }

    const generateButton = createButton("Generate")
    generateButton.on("pointertap", options.onGenerateWorld)
    generateButton.position.set(0, gridViewDimensions.height)
    UI.addChild(generateButton)

    const widthSlider = createSlider(dimensionSliderDimensions,
        {min: 1, max: 200}, "gridWidth", options.onSettingChange)
    widthSlider.position.set(0, generateButton.y + generateButton.height)
    UI.addChild(widthSlider)

    const heightSlider = createSlider(dimensionSliderDimensions,
        {min: 1, max: 200}, "gridHeight", options.onSettingChange)
    heightSlider.position.set(0, widthSlider.y + widthSlider.height)
    UI.addChild(heightSlider)

    return UI
}

const createButton = (
    text: string,
    margin: number = 10
) => {
    const button = new PIXI.Container()
    const textElement = new PIXI.Text({
        x: margin, y: margin,
        text: text,
        style : textStyle,
    })
    const background = new PIXI.Sprite({
        width: textElement.width + margin * 2, height: textElement.height + margin * 2,
        parent: button,
        texture: PIXI.Texture.WHITE,
        tint: "0x333333"
    })
    button.addChild(background)
    button.addChild(textElement)
    button.eventMode = "static"
    button.on("pointerenter", () => {background.tint = "0x222222"})
    button.on("pointerleave", () => {background.tint = "0x333333"})
    return button
}

const createSlider = (
    dimensions: {width: number, height: number},
    range: {min: number, max: number},
    sliderId: keyof WorldSettings,
    onChange: (id: keyof WorldSettings, value: number) => void
)=> {
    const clampValue = (value: number, min: number, max: number) => {
        return Math.min(Math.max(value, min), max)
    }
    const adjust = (value: number) => {
        handle.position.set((value - range.min) / (range.max - range.min) * handleVisualRange.max, 0)

        value = Math.round(value)
        valueText.text = value.toString()
        valueText.position.set(handle.x + (handle.width - valueText.width) / 2, (handle.height - valueText.height) / 2)
    }
    let value = 0
    const slider = new PIXI.Container()

    const background = new PIXI.Sprite({
        width: dimensions.width, height: dimensions.height,
        parent: slider,
        texture: PIXI.Texture.WHITE,
        tint: "#111111"
    })

    const handle = new PIXI.Sprite({
        width: dimensions.width / 10, height: dimensions.height,
        parent: slider,
        texture: PIXI.Texture.WHITE,
        tint: "#444444"
    })
    const valueText = new PIXI.Text({text: value, style: textStyle, parent: slider})

    const handleVisualRange = {max: dimensions.width - handle.width}

    background.eventMode = "static"
    let dragging = false
    background.on("pointerdown", () => {dragging = true})
    background.on("pointerup", () => {dragging = false})
    background.on("pointerupoutside", () => {dragging = false})

    background.on("pointermove", (event) => {
        if (dragging) {
            value = clampValue(Math.round((event.getLocalPosition(slider).x - handle.width / 2) / handleVisualRange.max
                * (range.max - range.min) + range.min), range.min, range.max)
            onChange(sliderId, value)
            adjust(value)
        }
    })

    adjust(worldSettings[sliderId])
    return slider
}
