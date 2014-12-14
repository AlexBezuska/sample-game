var ECS = require("entity-component-system");
var timeAccumulator = require("time-accumulator");

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var Keyboard = require("game-keyboard");
var keyMap = require("game-keyboard/key_map")["US"];
var keyboard = new Keyboard(keyMap);

function position(x, y) {
	return { x: x, y: y };
}
var velocity = position;

function size(width, height) {
	return { width: width, height: height };
}
function home(x, y, width, height) {
	return { x: x, y: y, width: width, height: height };
}
function friction(amount) {
	return { amount: amount }
}

function twoDimensionalMovement() {
	return {
		up: false,
		down: false,
		left: false,
		right: false,
		upAccel: -0.1,
		downAccel: 0.1,
		leftAccel: -0.1,
		rightAccel: 0.1,
		upMax: -1,
		downMax: 1,
		leftMax: -1,
		rightMax: 1
	};
}

function moveInTwoDimensions(entity, elapsed) {
	if (!entity.velocity || !entity.twoDimensionalMovement) {
		return;
	}
	if (entity.twoDimensionalMovement.up && entity.velocity.y > entity.twoDimensionalMovement.upMax) {
		entity.velocity.y += entity.twoDimensionalMovement.upAccel;
	}
	if (entity.twoDimensionalMovement.down && entity.velocity.y < entity.twoDimensionalMovement.downMax) {
		entity.velocity.y += entity.twoDimensionalMovement.downAccel;
	}
	if (entity.twoDimensionalMovement.left && entity.velocity.x > entity.twoDimensionalMovement.leftMax) {
		entity.velocity.x += entity.twoDimensionalMovement.leftAccel;
	}
	if (entity.twoDimensionalMovement.right && entity.velocity.x < entity.twoDimensionalMovement.rightMax) {
		entity.velocity.x += entity.twoDimensionalMovement.rightAccel;
	}
}

function movement(entity, elapsed) {
	if (!entity.position || !entity.velocity) {
		return;
	}
	entity.position.x += entity.velocity.x * elapsed;
	entity.position.y += entity.velocity.y * elapsed;
}

function bounceInHome(entity, elapsed) {
	if (!entity.position || !entity.velocity || !entity.home) {
		return;
	}

	if (entity.position.x < entity.home.x) {
		entity.velocity.x = Math.abs(entity.velocity.x);
	}
	if (entity.position.y < entity.home.y) {
		entity.velocity.y = Math.abs(entity.velocity.y);
	}
	if (entity.position.x + entity.size.width > entity.home.x + entity.home.width) {
		entity.velocity.x = -Math.abs(entity.velocity.x);
	}
	if (entity.position.y + entity.size.height > entity.home.y + entity.home.height) {
		entity.velocity.y = -Math.abs(entity.velocity.y);
	}
}

function controlPlayers(entity, elapsed) {
	if (!entity.twoDimensionalMovement) {
		return;
	}
	entity.twoDimensionalMovement.up = keyboard.isPressed("w");
	entity.twoDimensionalMovement.down = keyboard.isPressed("s");
	entity.twoDimensionalMovement.left = keyboard.isPressed("a");
	entity.twoDimensionalMovement.right = keyboard.isPressed("d");

	if (keyboard.consumePressed("l")) {
		console.log("l");
		entity.velocity.x *= 2;
		entity.velocity.y *= 2;
	}
	if (keyboard.consumePressed("h")) {
		console.log("h");
		box("green");
	}
	if (keyboard.consumePressed("r")) {
		console.log("r");
		console.log(Object.keys(game.entities).length, "entities");
	}
}

function applyFriction(entity, elapsed) {
	if (!entity.velocity || !entity.friction) {
		return;
	}

	entity.velocity.x *= entity.friction.amount;
	entity.velocity.y *= entity.friction.amount;
}

var game = new ECS();
var id = box("white");
game.addComponent(id, "twoDimensionalMovement", twoDimensionalMovement());

game.addSystem("simulation", controlPlayers);
game.addSystem("simulation", moveInTwoDimensions);
game.addSystem("simulation", movement);
game.addSystem("simulation", applyFriction);
game.addSystem("simulation", bounceInHome);
game.addSystem("render", draw);

function box(color) {
	var id = game.addEntity();
	game.addComponent(id, "position", position(0, 0));
	game.addComponent(id, "velocity", velocity(0, 0));
	game.addComponent(id, "friction", friction(0.95));
	game.addComponent(id, "size", size(100, 100));
	game.addComponent(id, "home", home(0, 0, canvas.width, canvas.height));
	game.addComponent(id, "strokeStyle", color);
	return id;
}

function draw(entity, context) {
	if (!entity.position || !entity.size) {
		return;
	}
	if (entity.strokeStyle) {
		context.strokeStyle = entity.strokeStyle;
	}
	context.strokeRect(entity.position.x, entity.position.y, entity.size.width, entity.size.height);
}

var run = timeAccumulator(5);
var timeDelta = require("./lib/absolute-to-relative")();
function render(time) {
	var elapsed = timeDelta(time);

	run(elapsed, function(elapsed) {
		game.run("simulation", elapsed);
	});
	context.clearRect(0, 0, canvas.width, canvas.height);
	game.run("render", context);
	window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
