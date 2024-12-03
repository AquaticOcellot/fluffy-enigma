<script lang="ts">
    import * as PIXI from "pixi.js"
    import {onMount} from "svelte"
    import {Perlin} from "./perlin"
    import {UI} from "./ui"
    import {eventBus} from "./events"

    const windowWidth = 1600
    const windowHeight = 800
    const gridSize = [800, 800]
    const uiPosition = [1000, 0]
    const baseTexture = PIXI.Texture.WHITE
    let gridContainer: PIXI.Container

    let app = new PIXI.Application()

    const textStyle = new PIXI.TextStyle({
        fill: "0xffffff",
        fontSize: 20,
        wordWrap: true,
        breakWords: true,
        wordWrapWidth: 200
    })
    const sidePanelText = new PIXI.Text({
        text: "",
        style: textStyle,})
    app.stage.addChild(sidePanelText)

    const scaleApp = () => {
        const scale = Math.min(window.innerHeight / windowHeight, window.innerWidth / windowWidth);
        app.stage.scale.set(scale, scale)
        app.renderer.resize(windowWidth * scale, windowHeight * scale)
    }

    const generateGrid = (position: number[], dimensions: number[]) => {
        let data: number[][] = Perlin(dimensions, 8)
        if (gridContainer) {
            gridContainer.destroy({children:true})
        }

        gridContainer = new PIXI.Container()
        gridContainer.position.set(position[0], position[1])
        gridContainer.scale.set(Math.min(gridSize[0] / dimensions[0], gridSize[1] / dimensions[1]))
        app.stage.addChild(gridContainer)
        for (let row_index = 0; row_index < dimensions[1]; row_index++) {
            for (let col_index = 0; col_index < dimensions[0]; col_index++) {
                const cellSprite = new PIXI.Sprite({
                    x:col_index, y:row_index,
                    texture: baseTexture, alpha: data[row_index][col_index],
                })
                cellSprite.interactive = true
                cellSprite.on("pointerenter", () => {
                    cellSprite.tint = 0xff0000
                    sidePanelText.text = `Cell at [${col_index}, ${row_index}]\nCost: ${data[row_index][col_index]}`
                })
                cellSprite.on("pointerleave", () => {
                    cellSprite.tint = 0xffffff
                })
                gridContainer.addChild(cellSprite)
            }
        }
    }

    onMount(async () => {
        await app.init({width: windowWidth, height: windowHeight})
        document.getElementById("app-container")?.appendChild(app.canvas)

        scaleApp()
        window.addEventListener("resize", scaleApp)

        generateGrid([200, 0], [80, 80])

        const ui = UI()
        ui.position.set(uiPosition[0], uiPosition[1])
        app.stage.addChild(ui)

        eventBus.on("generateGrid", (dimensions) => {generateGrid([200, 0], dimensions)})
    })
</script>

<main id="app-container"></main>

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