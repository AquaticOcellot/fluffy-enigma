import * as PIXI from "pixi.js"
import {playerConfig} from "../config/initialSettings"
import type {Vector2} from "../types"

export const createPlayerGraphic = () => {
    const playerGraphic = new PIXI.Graphics()
    playerGraphic.circle(0, 0, playerConfig.radius).fill(0x42f59b)
    return playerGraphic
}

export const renderPlayer = (playerGraphic: PIXI.Graphics, position: Vector2) => {
    playerGraphic.position.set(position.x, position.y)
}

