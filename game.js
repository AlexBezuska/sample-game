var ECS = require("entity-component-system");
var timeAccumulator = require("time-accumulator");

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var Keyboard = require("game-keyboard");
var keyMap = require("game-keyboard/key_map")["US"];
var keyboard = new Keyboard(keyMap);

var position = require("./lib/components/position");
var velocity = position;
var size = require("./lib/components/size");
var friction = require("./lib/components/friction");
var playableArea = require("./lib/components/playable-area");

var applyVelocity = require("./lib/systems/apply-velocity");
var applyFriction = require("./lib/systems/apply-friction");
var constrainToPlayableArea = require("./lib/systems/constrain-to-playable-area");
var drawRectangles = require("./lib/systems/draw-rectangles");

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

function controlPlayers(entity, elapsed) {
	if (!entity.twoDimensionalMovement || !entity.keyboard) {
		return;
	}
	entity.twoDimensionalMovement.up = keyboard.isPressed("w");
	entity.twoDimensionalMovement.down = keyboard.isPressed("s");
	entity.twoDimensionalMovement.left = keyboard.isPressed("a");
	entity.twoDimensionalMovement.right = keyboard.isPressed("d");
}

function target(target) {
	return { target: target };
}

function chaseTarget(entity, elapsed) {
	if (!entity.twoDimensionalMovement || !entity.target) {
		return;
	}

	var target = this.getEntity(entity.target.target);

	entity.twoDimensionalMovement.up = target.position.y < entity.position.y;
	entity.twoDimensionalMovement.down = target.position.y > entity.position.y;
	entity.twoDimensionalMovement.left = target.position.x < entity.position.x;
	entity.twoDimensionalMovement.right = target.position.x > entity.position.x;
}

var game = new ECS();
game.addSystem("simulation", controlPlayers);
game.addSystem("simulation", chaseTarget);
game.addSystem("simulation", moveInTwoDimensions);
game.addSystem("simulation", applyVelocity);
game.addSystem("simulation", applyFriction);
game.addSystem("simulation", constrainToPlayableArea);
game.addSystem("render", drawRectangles);

var player = box("white", 0, 0);
game.addComponent(player, "keyboard", true);

var enemy = box("red", 500, 500);
game.addComponent(enemy, "target", target(player));
var e = game.getEntity(enemy);
e.twoDimensionalMovement.upMax = -0.5;
e.twoDimensionalMovement.downMax = 0.5;
e.twoDimensionalMovement.leftMax = -0.5;
e.twoDimensionalMovement.rightMax = 0.5;

function box(color, x, y) {
	var id = game.addEntity();
	game.addComponent(id, "position", position(x, y));
	game.addComponent(id, "velocity", velocity(0, 0));
	game.addComponent(id, "friction", friction(0.95, 0.95));
	game.addComponent(id, "size", size(100, 100));
	game.addComponent(id, "twoDimensionalMovement", twoDimensionalMovement());
	game.addComponent(id, "playableArea", playableArea(0, 0, canvas.width, canvas.height));
	game.addComponent(id, "strokeStyle", color);
	return id;
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
