import {eventBus} from "./events";

export const data: {[key: string]: number} = {
    gridWidth: 20,
    gridHeight: 10
}

eventBus.on("changeValue", (id: string, value: number) => {
    if (data[id] !== undefined) {data[id] = value}
})