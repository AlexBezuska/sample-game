module.exports = function constrainToPlayableArea(entity, elapsed) {
	if (!entity.position || !entity.playableArea) {
		return;
	}

	if (entity.position.x < entity.playableArea.x) {
		entity.position.x = entity.playableArea.x;
	}
	if (entity.position.x + entity.size.width > entity.playableArea.x + entity.playableArea.width) {
		entity.position.x = entity.playableArea.x + entity.playableArea.width - entity.size.width;
	}
	if (entity.position.y < entity.playableArea.y) {
		entity.position.y = entity.playableArea.y;
	}
	if (entity.position.y + entity.size.height > entity.playableArea.y + entity.playableArea.height) {
		entity.position.y = entity.playableArea.y + entity.playableArea.height - entity.size.height;
	}
};
