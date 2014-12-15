module.exports = {
	each: function applyFriction(entity, elapsed) {
		if (!entity.velocity || !entity.friction) {
			return;
		}

		entity.velocity.x *= entity.friction.x;
		entity.velocity.y *= entity.friction.y;
	}
};
