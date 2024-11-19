<script lang="ts">
    import * as PIXI from "pixi.js"
    import {onMount} from "svelte"
    import {Perlin} from "./perlin"

    const windowWidth = 1600
    const windowHeight = 800
    const baseCellDimension = 10
    const baseTexture = PIXI.Texture.WHITE

    let app = new PIXI.Application()

    const textStyle = new PIXI.TextStyle({
        fill: "0xffffff",
        fontSize: 20,
        wordWrap: true,
        breakWords: true,
        wordWrapWidth: 200
    })
    const sidePanelText = new PIXI.Text({
        text: "12311111111111111111111111111111111111111111111111 111111111111111 11111111 111111  1 1 1 1 11",
        style: textStyle,})
    app.stage.addChild(sidePanelText)

    const scaleApp = () => {
        const scale = Math.min(window.innerHeight / windowHeight, window.innerWidth / windowWidth);
        app.stage.scale.set(scale, scale)
        app.renderer.resize(windowWidth * scale, windowHeight * scale)
    }

    const generateGrid = (position: number[], dimensions: number[]) => {
        let data: number[][] = Perlin(dimensions, 8)
        console.log(data)

        const gridContainer = new PIXI.Container()
        gridContainer.position.set(position[0], position[1])
        app.stage.addChild(gridContainer)
        for (let row_index = 0; row_index < dimensions[1]; row_index++) {
            for (let col_index = 0; col_index < dimensions[0]; col_index++) {
                const cellSprite = new PIXI.Sprite({
                    x:baseCellDimension * col_index, y:baseCellDimension * row_index,
                    width: baseCellDimension, height: baseCellDimension,
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