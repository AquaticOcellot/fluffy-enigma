import * as PIXI from "pixi.js"
import {eventBus} from "./events"

const margin = 5
const textStyle = new PIXI.TextStyle({
    fill: "0xffffff",
    fontSize: 20,
})
const generateButtonPosition = [0, 0]
const dimensionSliderDimensions = [600, 50]
let gridDimensions = [0, 0]

export const UI = () => {
    const UI = new PIXI.Container()

    const generateButton = createButton("Generate")
    generateButton.addEventListener("pointertap", () => {eventBus.emit("generateGrid", gridDimensions)})
    generateButton.position.set(generateButtonPosition[0], generateButtonPosition[1])
    UI.addChild(generateButton)

    const dimensionSlider = createSlider(dimensionSliderDimensions, [1, 200], 1)
    dimensionSlider.position.set(0, generateButton.y + generateButton.height)
    UI.addChild(dimensionSlider)

    return UI
}

const createButton = (
    text: string,
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
    button.interactive = true
    button.addEventListener("pointerenter", () => {background.tint = "0x222222"})
    button.addEventListener("pointerleave", () => {background.tint = "0x333333"})
    return button
}

const createSlider = (
    dimensions: number[],
    range: number[],
    initialValue: number,
)=> {
    const clampValue = (value: number, min: number, max: number) => {
        return Math.min(Math.max(value, min), max)
    }
    const adjustText = () => {
        value = Math.round(value)
        dimensions = [value, value]
        valueText.text = value.toString()
        valueText.position.set(handle.x + (handle.width - valueText.width) / 2, (handle.height - valueText.height) / 2)
    }
    let value = clampValue(initialValue, range[0], range[1])
    const slider = new PIXI.Container()

    const background = new PIXI.Sprite({
        width: dimensions[0], height:dimensions[1],
        parent: slider,
        texture: PIXI.Texture.WHITE,
        tint: "0x111111"
    })

    const handle = new PIXI.Sprite({
        width: dimensions[0] / 10, height:dimensions[1],
        parent: slider,
        texture: PIXI.Texture.WHITE,
        tint: "0x444444"
    })
    const valueText = new PIXI.Text({text: value, style: textStyle, parent: slider})

    const handleVisualRange = [0, dimensions[0] - handle.width]
    background.interactive = true
    let dragging = false
    const disableDragging = () => {
        dragging = false
    }
    background.addEventListener("pointerdown", () => {dragging = true})
    background.addEventListener("pointerup", disableDragging)
    background.addEventListener("pointerupoutside", disableDragging)

    background.addEventListener("pointermove", (event) => {
        if (dragging) {
            handle.position.set(clampValue(
                event.getLocalPosition(slider).x - handle.width / 2, handleVisualRange[0], handleVisualRange[1]), 0)
            value = Math.round(handle.position.x / handleVisualRange[1] * (range[1] - range[0]) + range[0])
            gridDimensions = [value, value]
            adjustText()
        }
    })

    return slider
}
