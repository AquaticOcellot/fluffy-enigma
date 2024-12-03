import EventEmitter from "eventemitter3"

type EventMap = {
    generateGrid: (dimensions: number[]) => void
}
export const eventBus = new EventEmitter<EventMap>()