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

	on<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());
		const event = this.getEvent(eventName);

		const conn = event.Event.Connect(callback);
		this.connections.get(eventName)!.set(callback, conn);

		return this;
	}

	once<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());
		const event = this.getEvent(eventName);

		const conn = event.Event.Connect((...args: unknown[]) => {
			callback(...args);
			conn.Disconnect();
			this.connections.get(eventName)!.delete(callback);
		});
		if (conn.Connected) this.connections.get(eventName)!.set(callback, conn);

		return this;
	}

	off<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());
		const conn = this.connections.get(eventName)!.get(callback);
		if (conn) {
			conn.Disconnect();
			this.connections.get(eventName)!.delete(callback);
		}

		return this;
	}

	emit<E extends EventKey<Events>>(eventName: E, ...args: Parameters<Events[E]>): this {
		this.getEvent(eventName).Fire(...(args as unknown[]));

		return this;
	}

	eventNames(): EventKey<Events>[] {
		const keys: EventKey<Events>[] = [];
		this.events.forEach((_, key) => keys.push(key));

		return keys;
	}

	listeners<E extends EventKey<Events>>(eventName: E): Function[] {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());

		const listeners: Callback[] = [];
		this.connections.get(eventName)!.forEach((_, key) => listeners.push(key));

		return listeners;
	}

	listenerCount<E extends EventKey<Events>>(eventName: E): number {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());

		let amount = 0;
		this.connections.get(eventName)!.forEach(() => amount++);

		return amount;
	}

	removeAllListeners<E extends EventKey<Events>>(eventName: E): this {
		if (!this.connections.has(eventName)) this.connections.set(eventName, new Map());

		this.connections.get(eventName)!.forEach((conn) => conn.Disconnect());
		this.connections.get(eventName)!.clear();

		return this;
	}
}
