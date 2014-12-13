var ECS = require("entity-component-system");
var timeAccumulator = require("time-accumulator");

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");


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

var game = new ECS();
var id = box("white");
game.addSystem("simulation", movement);
game.addSystem("simulation", bounceInHome);
game.addSystem("render", draw);

function box(color) {
	var id = game.addEntity();
	game.addComponent(id, "position", position(0, 0));
	game.addComponent(id, "velocity", velocity(0.5, 0.5));
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


window.addEventListener("keydown", function(e) {
	console.log(e.key);

	if (e.key === "j") {
		game.removeComponent(id, "velocity");
	}
	if (e.key === "k") {
		game.addComponent(id, "velocity", velocity(0.5, 0.5));
	}
	if (e.key === "l") {
		var entity = game.getEntity(id);
		entity.velocity.x *= 2;
		entity.velocity.y *= 2;
	}
	if (e.key === "h") {
		box("green");
	}
	if (e.key === "r") {
		console.log(Object.keys(game.entities).length, "entities");
	}
});

var run = timeAccumulator(5);
var timeDelta = require("./lib/absolute-to-relative")();
function render(time) {
	var elapsed = timeDelta(time);

	context.clearRect(0, 0, canvas.width, canvas.height);
	run(elapsed, function(elapsed) {
		game.run("simulation", elapsed);
	});
	game.run("render", context);
	window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
