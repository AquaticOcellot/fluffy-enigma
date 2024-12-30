import * as PIXI from "pixi.js"
import {eventBus} from "./events"
import {data} from "./data"

const margin = 5
const textStyle = new PIXI.TextStyle({
    fill: "0xffffff",
    fontSize: 20,
})
const generateButtonPosition = [0, 0]
const dimensionSliderDimensions = [600, 50]

export const UI = () => {
    const UI = new PIXI.Container()

    const generateButton = createButton("Generate")
    generateButton.addEventListener("pointertap", () => {eventBus.emit("generateGrid")})
    generateButton.position.set(generateButtonPosition[0], generateButtonPosition[1])
    UI.addChild(generateButton)

    const widthSlider = createSlider(dimensionSliderDimensions, [1, 200], "gridWidth")
    eventBus.emit("adjustSlider", "gridWidth", data["gridWidth"])
    widthSlider.position.set(0, generateButton.y + generateButton.height)
    UI.addChild(widthSlider)

    const heightSlider = createSlider(dimensionSliderDimensions, [1, 200], "gridHeight")
    heightSlider.position.set(0, widthSlider.y + widthSlider.height)
    UI.addChild(heightSlider)

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
    sliderId: string
)=> {
    const clampValue = (value: number, min: number, max: number) => {
        return Math.min(Math.max(value, min), max)
    }
    const adjust = (value: number) => {
        handle.position.set(value / (range[1] - range[0]) * handleVisualRange[1], 0)

        value = Math.round(value)
        valueText.text = value.toString()
        valueText.position.set(handle.x + (handle.width - valueText.width) / 2, (handle.height - valueText.height) / 2)
    }
    let value = 0
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
    background.addEventListener("pointerdown", () => {dragging = true})
    background.addEventListener("pointerup", () => {dragging = false})
    background.addEventListener("pointerupoutside", () => {dragging = false})

    background.addEventListener("pointermove", (event) => {
        if (dragging) {
            value = clampValue(Math.round((event.getLocalPosition(slider).x - handle.width / 2) / handleVisualRange[1]
                * (range[1] - range[0]) + range[0]), range[0], range[1])
            eventBus.emit("changeValue", sliderId, value)
            adjust(value)
        }
    })

    eventBus.on("adjustSlider", (id, value) => {
        if (id === sliderId) {
            adjust(value)
        }
    })

    adjust(data[sliderId])
    return slider
}
