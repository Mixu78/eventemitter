export = class Spy {
	public callCount: number;
	public values: unknown[];
	public valuesLength: number;

	constructor() {
		this.callCount = 0;
		this.values = [];
		this.valuesLength = 0;
	}

	value(...args: unknown[]) {
		this.callCount++;
		this.values = args;
		this.valuesLength = args.size();
	}

	calledWithShallow(...arr: unknown[]) {
		for (let i = 0; i < this.values.size(); i++) {
			if (arr[i] !== this.values[i]) return false;
		}
		return true;
	}
};
