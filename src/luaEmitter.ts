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
	private events: Map<EventKey<Events>, Callback[]>;

	constructor() {
		this.events = new Map();
	}

	private getEvent(eventName: EventKey<Events>): Callback[] {
		if (!this.events.has(eventName)) {
			this.events.set(eventName, []);
		}

		return this.events.get(eventName)!;
	}

	on<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this {
		this.getEvent(eventName).push(callback);
		return this;
	}

	once<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this {
		const fn = (...args: unknown[]) => {
			callback(...args);
			const index = this.getEvent(eventName).indexOf(fn);
			if (index !== undefined) this.getEvent(eventName).remove(index);
		};
		this.getEvent(eventName).push(fn);
		return this;
	}

	off<E extends EventKey<Events>>(eventName: E, callback: Events[E]): this {
		this.getEvent(eventName);

		this.events.set(
			eventName,
			this.getEvent(eventName).filter((c) => c !== callback),
		);

		return this;
	}

	emit<E extends EventKey<Events>>(eventName: E, ...args: Parameters<Events[E]>): this {
		for (const callback of this.getEvent(eventName)) {
			coroutine.wrap(callback)(...(args as unknown[]));
		}
		return this;
	}

	eventNames(): EventKey<Events>[] {
		const eventNames: EventKey<Events>[] = [];
		this.events.forEach((_, name) => eventNames.push(name));
		return eventNames;
	}

	listeners<E extends EventKey<Events>>(eventName: E): Function[] {
		return [...this.getEvent(eventName)];
	}

	listenerCount<E extends EventKey<Events>>(eventName: E): number {
		return this.getEvent(eventName).size();
	}

	removeAllListeners<E extends EventKey<Events>>(eventName: E): this {
		this.events.set(eventName, []);
		return this;
	}
}
