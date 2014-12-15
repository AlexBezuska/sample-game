module.exports = {
	each: function applyVelocity(entity, elapsed) {
		if (!entity.position || !entity.velocity) {
			return;
		}
		entity.position.x += entity.velocity.x * elapsed;
		entity.position.y += entity.velocity.y * elapsed;
	}
};
