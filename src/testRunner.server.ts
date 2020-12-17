import TestEZ from "@rbxts/testez";

interface RepStorage extends ReplicatedStorage {
	tests: Folder;
}

const results = TestEZ.TestBootstrap.run([(game.GetService("ReplicatedStorage") as RepStorage).tests]);

if (results.errors.size() > 0 || results.failureCount > 0) {
	error("Tests failed!");
}
