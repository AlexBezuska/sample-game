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
var boxCollider = require("./lib/systems/box-collider");

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

var moveInTwoDimensions = {
	each: function moveInTwoDimensions(entity, elapsed) {
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
};

var controlPlayers = {
	each: function(entity, elapsed) {
		if (!entity.twoDimensionalMovement || !entity.keyboard) {
			return;
		}
		entity.twoDimensionalMovement.up = keyboard.isPressed("w");
		entity.twoDimensionalMovement.down = keyboard.isPressed("s");
		entity.twoDimensionalMovement.left = keyboard.isPressed("a");
		entity.twoDimensionalMovement.right = keyboard.isPressed("d");
	}
};

function target(id) {
	return { id: id };
}

function center(entity) {
	var x = entity.position.x + Math.floor(entity.size.width / 2);
	var y = entity.position.y + Math.floor(entity.size.height / 2);
	return [x, y];
}
var chaseTarget = {
	each: function (entity, elapsed) {
		if (!entity.twoDimensionalMovement || !entity.target) {
			return;
		}

		var src = center(entity);
		var target = this.getEntity(entity.target.id);
		var dst = center(target);

		entity.twoDimensionalMovement.up = dst[1] < src[1];
		entity.twoDimensionalMovement.down = dst[1] > src[1];
		entity.twoDimensionalMovement.left = dst[0] < src[0];
		entity.twoDimensionalMovement.right = dst[0] > src[0];
	}
};

var game = new ECS();
game.addSystem("simulation", controlPlayers);
game.addSystem("simulation", chaseTarget);
game.addSystem("simulation", moveInTwoDimensions);
game.addSystem("simulation", applyVelocity);
game.addSystem("simulation", applyFriction);
game.addSystem("simulation", constrainToPlayableArea);
game.addSystem("simulation", boxCollider);
game.addSystem("render", drawRectangles);
game.addSystem("render", {
	each: function(entity, context) {
		if (!entity.position || !entity.size || !entity.collisions || entity.collisions.length === 0) {
			return;
		}
		context.fillStyle = "rgba(0, 255, 0, 0.3)";
		context.fillRect(entity.position.x, entity.position.y, entity.size.width, entity.size.height);
	}
});

var player = box("white", 0, 0, 100, 100);
game.addComponent(player, "keyboard", true);

var enemy = box("red", 500, 500, 50, 50);
game.addComponent(enemy, "target", target(player));
var e = game.getEntity(enemy);
e.twoDimensionalMovement.upMax = -0.5;
e.twoDimensionalMovement.downMax = 0.5;
e.twoDimensionalMovement.leftMax = -0.5;
e.twoDimensionalMovement.rightMax = 0.5;

function box(color, x, y, width, height) {
	var id = game.addEntity();
	game.addComponent(id, "position", position(x, y));
	game.addComponent(id, "size", size(width, height));
	game.addComponent(id, "velocity", velocity(0, 0));
	game.addComponent(id, "friction", friction(0.95, 0.95));
	game.addComponent(id, "twoDimensionalMovement", twoDimensionalMovement());
	game.addComponent(id, "playableArea", playableArea(0, 0, canvas.width, canvas.height));
	game.addComponent(id, "strokeStyle", color);
	game.addComponent(id, "collisions", []);
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
