import EventEmitter from "eventemitter3"

type EventMap = {
    generate: void
}
export const eventBus = new EventEmitter<EventMap>()