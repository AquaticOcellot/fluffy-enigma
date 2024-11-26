import * as PIXI from "pixi.js"
import {eventBus} from "./events"

export const Button = (
    text: string,
    position : number[]
) => {
    const button = new PIXI.Container({
        x: position[0], y: position[1]
    })
    const textElement = new PIXI.Text({
        x: 5, y: 5,
        text: text,
        style : new PIXI.TextStyle({
            fill: "0xffffff",
            fontSize: 20,
        }),
    })
    const background = new PIXI.Sprite({
        width: textElement.width + 10, height: textElement.height + 10,
        parent: button,
        texture: PIXI.Texture.WHITE,
        tint: "0x333333"
    })
    button.addChild(background)
    button.addChild(textElement)
    button.interactive = true
    button.addEventListener("pointerenter", () => {background.tint = "0x222222"})
    button.addEventListener("pointerleave", () => {background.tint = "0x333333"})
    button.addEventListener("pointertap", () => {eventBus.emit("generate")})
    return button
}
