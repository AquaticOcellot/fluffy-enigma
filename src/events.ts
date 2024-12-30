import EventEmitter from "eventemitter3"

type EventMap = {
    changeValue: (id: string, value: number) => void
    adjustSlider: (id: string, value: number) => void
    generateGrid: () => void
}
export const eventBus = new EventEmitter<EventMap>()