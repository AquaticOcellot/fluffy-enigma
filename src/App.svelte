<script lang="ts">
    import {onMount} from "svelte"
    import type * as PIXI from "pixi.js"
    import {createKeyboardInput, type KeyboardInput} from "./input/keyboard"
    import {createPixiScene, type PixiScene} from "./render/pixiScene"
    import {createFixedStepLoop, updateGame, type FixedStepLoop} from "./simulation/simulation"
    import {createGameState, regenerateWorld, type GameState} from "./state/gameState"
    import {setSetting, worldConfig} from "./state/settings"
    import {createUI, type UIContainer} from "./ui"
    import type {WorldSettings} from "./types";

    let container: HTMLElement
    let scene: PixiScene
    let input: KeyboardInput
    let ui: UIContainer
    let gameState: GameState
    let simulation: FixedStepLoop

    const regenerateScene = () => {
        regenerateWorld(gameState, worldConfig)

        ui.clearHoverInfo()
        scene.renderPreview(gameState.world.grid)
        scene.renderWorld(gameState.world)
        scene.setPlayerPosition(gameState.player.position)
    }

    const handleSettingChange = (id: keyof WorldSettings, value: number): void => {
        setSetting(id, value)
    }

    onMount(() => {
        const tick = (ticker: PIXI.Ticker) => {
            const changed = simulation.update(ticker.deltaMS / 1000)

            if (changed) {
                scene.setPlayerPosition(gameState.player.position)
            }
        }

        const handleWheel = (event: WheelEvent) => {
            scene.applyZoomFromWheel(event)
        }

        const init = async () => {
            ui = createUI({
                onGenerateWorld: regenerateScene,
                onSettingChange: handleSettingChange,
            })
            scene = createPixiScene()
            input = createKeyboardInput(window)
            gameState = createGameState(worldConfig)
            simulation = createFixedStepLoop((deltaSeconds) => updateGame(gameState, input, deltaSeconds))

            await scene.init(container, ui)
            regenerateScene()

            window.addEventListener("wheel", handleWheel, {passive: false})
            scene.app.ticker.add(tick)
        }

        void init()

        return () => {
            window.removeEventListener("wheel", handleWheel)
            scene?.app.ticker.remove(tick)
            input?.destroy()
            scene?.destroy()
        }
    })
</script>

<main bind:this={container}></main>

<style>
    main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        border: 0;
        background-color: #111111;
    }
</style>
