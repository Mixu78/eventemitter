# @rbxts/eventemitter

[![NPM](https://nodei.co/npm/@rbxts/eventemitter.png)](https://npmjs.org/package/@rbxts/eventemitter)

Node.js-inspired event emitter class. Also typesafe.

## Installation
```npm i @rbxts/eventemitter```

## Usage
First make an interface with ```eventName: listenerFunction``` pairs, for example
```ts
interface GameEvents {
	playerGotItem: (player: Player, item: Item) => void;
	playerDied: (player: Player, item: Item) => void;
}
```
Then create the emitter like so:
```ts
const Emitter = new EventEmitter<GameEvents>();
```
where GameEvents is your event interface.

## Example
```ts
import EventEmitter from "@rbxts/eventemitter";

interface Events {
	playerDead: (playerName: string) => void;
}

const Emitter = new EventEmitter<Events>();

Emitter.on("playerDead", (player) => print(`${player} died!`));

Emitter.emit("playerDead", "Mixu_78");
```