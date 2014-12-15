module.exports = function drawRectangles(entity, context) {
	if (!entity.position || !entity.size) {
		return;
	}
	if (entity.strokeStyle) {
		context.strokeStyle = entity.strokeStyle;
	}
	context.strokeRect(entity.position.x, entity.position.y, entity.size.width, entity.size.height);
};
