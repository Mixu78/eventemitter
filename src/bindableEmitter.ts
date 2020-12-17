type EventKey<T> = Extract<keyof T, string | symbol>;

interface IEventBus<Events extends Record<EventKey<Events>, Callback>> {
	on<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this;
	once<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this;
	off<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this;
	removeAllListeners<E extends EventKey<Events>>(eventName: E): this;
	emit<E extends EventKey<Events>>(eventName: E, ...args: Parameters<Events[E]>): this;

	eventNames(): EventKey<Events>[];
	listeners<E extends EventKey<Events>>(eventName: E): Function[];
	listenerCount<E extends EventKey<Events>>(eventName: E): number;
}

export class EventEmitter<Events extends Record<EventKey<Events>, Callback> = never> implements IEventBus<Events> {
	private events: Map<EventKey<Events>, BindableEvent>;
	private connections: Map<EventKey<Events>, Map<Callback, RBXScriptConnection>>;

	constructor() {
		this.events = new Map();
		this.connections = new Map();
	}

	private getEvent<E extends EventKey<Events>>(event: E): BindableEvent {
		if (!this.events.has(event)) {
			const bindable = new Instance("BindableEvent");
			//bindable.Name = typeIs(event, "string") ? event : "Symbol-named event";
			this.events.set(event, bindable);
		}
		return this.events.get(event)!;
	}

	/**
	 * Binds a listener function to an event.
	 *
	 * @param eventName Name of event to bind to
	 * @param listener Function to bind to event
	 */
	on<E extends EventKey<Events>>(eventName: E, listener: Events[E]): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());
		const event = this.getEvent(eventName);

		if (this.connections.get(eventName)!.has(listener)) throw "Listeners may not be registered twice!";

		const conn = event.Event.Connect(listener);
		this.connections.get(eventName)!.set(listener, conn);

		return this;
	}

	/**
	 * Binds a listener function to an event, and disconnects it after the event was fired.
	 *
	 * @param eventName Name of event to bind to
	 * @param listener Function to bind to event
	 */
	once<E extends EventKey<Events>>(eventName: E, listener: Events[E]): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());
		const event = this.getEvent(eventName);

		if (this.connections.get(eventName)!.has(listener)) throw "Listeners may not be registered twice!";

		const conn = event.Event.Connect((...args: unknown[]) => {
			conn.Disconnect();
			this.connections.get(eventName)!.delete(listener);
			listener(...args);
		});
		if (conn.Connected) this.connections.get(eventName)!.set(listener, conn);

		return this;
	}

	/**
	 * Unbinds a listener function from an event.
	 *
	 * @param eventName Name of event to unbind from
	 * @param listener Function to unbind
	 */
	off<E extends EventKey<Events>>(eventName: E, listener: Events[E]): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());
		const conn = this.connections.get(eventName)!.get(listener);

		if (conn) {
			conn.Disconnect();
			this.connections.get(eventName)!.delete(listener);
		}

		return this;
	}

	/**
	 * Emits to the specified event with the arguments passed.
	 *
	 * @param eventName Name of event to emit to
	 * @param args Event arguments
	 */
	emit<E extends EventKey<Events>>(eventName: E, ...args: Parameters<Events[E]>): this {
		this.getEvent(eventName).Fire(...(args as unknown[]));

		return this;
	}

	/**
	 * Returns an array of all event names used so far.
	 */
	eventNames(): EventKey<Events>[] {
		const keys: EventKey<Events>[] = [];
		this.events.forEach((_, key) => keys.push(key));

		return keys;
	}

	/**
	 * Returns an array of all current listener functions for an event.
	 *
	 * @param eventName Name of event to get listeners for
	 */
	listeners<E extends EventKey<Events>>(eventName: E): Function[] {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());

		const listeners: Callback[] = [];
		this.connections.get(eventName)!.forEach((_, key) => listeners.push(key));

		return listeners;
	}

	/**
	 * Returns the amount of listeners currently connected to an event.
	 *
	 * @param eventName Name of event to get listener count for
	 */
	listenerCount<E extends EventKey<Events>>(eventName: E): number {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());

		let amount = 0;
		this.connections.get(eventName)!.forEach(() => amount++);

		return amount;
	}

	/**
	 * Removes all listeners from an event.
	 *
	 * @param eventName Name of event to remove listeners from
	 */
	removeAllListeners<E extends EventKey<Events>>(eventName: E): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());

		this.connections.get(eventName)!.forEach((conn) => conn.Disconnect());
		this.connections.get(eventName)!.clear();

		return this;
	}
}
