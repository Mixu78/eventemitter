/// <reference types="@rbxts/testez/globals"/>

import { BindableEmitter } from "..";
import Spy from "./spy";

interface TestEvents {
	test: () => void;
	parameterTest: (a: string, b: number) => void;
}

export = () => {
	it("should connect properly", () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const spy = new Spy();
		expect(Emitter.on("test", () => spy.value())).to.be.equal(Emitter);
	});

	it("should emit properly", () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const spy = new Spy();

		const emit = {
			a: "TestString",
			b: 10,
		};

		Emitter.on("parameterTest", (a, b) => spy.value(a, b));
		Emitter.emit("parameterTest", emit.a, emit.b);
		expect(spy.callCount).to.be.equal(1);
		expect(spy.valuesLength).to.be.equal(2);
		expect(spy.calledWithShallow(emit.a, emit.b)).to.be.ok();
	});

	it('should only call "once" handlers once', () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const spy = new Spy();

		const emit = {
			a: "TestString",
			b: 10,
		};

		Emitter.once("parameterTest", (a, b) => spy.value(a, b));
		Emitter.emit("parameterTest", emit.a, emit.b);
		Emitter.emit("parameterTest", emit.a, emit.b);
		expect(spy.callCount).to.be.equal(1);
	});

	it('should properly remove handler when "off" is used', () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const spy = new Spy();

		const emit = {
			a: "TestString",
			b: 10,
		};

		const cb = (...args: unknown[]) => spy.value(...args);

		Emitter.on("parameterTest", cb);
		Emitter.emit("parameterTest", emit.a, emit.b);
		Emitter.off("parameterTest", cb);
		Emitter.emit("parameterTest", emit.a, emit.b);
		expect(spy.callCount).to.be.equal(1);
	});

	it("should return the right eventNames", () => {
		const Emitter = new BindableEmitter<TestEvents>();

		Emitter.emit("parameterTest", "", 0);
		Emitter.emit("test");

		const check = (nameArr: string[], expected: string[]) => {
			for (const name of nameArr) {
				let ok = false;
				for (const val of expected) {
					if (name === val) ok = true;
				}
				if (!ok) return false;
			}
			return true;
		};

		expect(check(Emitter.eventNames(), ["test", "parameterTest"])).to.be.ok();
	});

	it("should return all the listeners currently listening", () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const cb = () => {};

		Emitter.on("test", cb);

		expect(Emitter.listeners("test")[0]).to.be.equal(cb);
	});

	it("should return the correct amount of listeners", () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const cb = () => {};
		const cb2 = () => {};

		Emitter.on("test", cb);
		Emitter.on("test", cb2);

		expect(Emitter.listenerCount("test")).to.be.equal(2);
	});

	it('should remove all listeners when "removeAllListeners" is called', () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const cb = () => {};
		const cb2 = () => {};

		Emitter.on("test", cb);
		Emitter.on("test", cb2);
		Emitter.removeAllListeners("test");

		expect(Emitter.listenerCount("test")).to.be.equal(0);
	});

	itSKIP("should work after error in callback", () => {
		const Emitter = new BindableEmitter<TestEvents>();
		const spy = new Spy();

		const cb = () => {
			error("oh no");
		};

		Emitter.on("test", cb);
		Emitter.on("test", () => spy.value());

		Emitter.emit("test");
		Emitter.emit("test");

		expect(spy.callCount).to.be.equal(2);
	});
};
