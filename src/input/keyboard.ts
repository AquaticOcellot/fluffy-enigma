import type {Vector2} from "../types"

export type KeyboardInput = {
    movement: () => Vector2
    drilling: () => boolean
    destroy: () => void
}

export const createKeyboardInput = (target: Window): KeyboardInput => {
    const pressedKeys = new Set<string>()

    const handleKeyDown = (event: KeyboardEvent) => {
        pressedKeys.add(event.key.toLowerCase())
        pressedKeys.add(event.code.toLowerCase())
    }

    const handleKeyUp = (event: KeyboardEvent) => {
        pressedKeys.delete(event.key.toLowerCase())
        pressedKeys.delete(event.code.toLowerCase())
    }

    target.addEventListener("keydown", handleKeyDown)
    target.addEventListener("keyup", handleKeyUp)

    return {
        movement: () => ({
            x: (pressedKeys.has("d") ? 1 : 0) - (pressedKeys.has("a") ? 1 : 0),
            y: (pressedKeys.has("s") ? 1 : 0) - (pressedKeys.has("w") ? 1 : 0),
        }),
        drilling: () => pressedKeys.has(" ") || pressedKeys.has("space"),
        destroy: () => {
            target.removeEventListener("keydown", handleKeyDown)
            target.removeEventListener("keyup", handleKeyUp)
        },
    }
}
