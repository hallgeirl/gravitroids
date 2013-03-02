function CollisionManager() {
	this.collidables = [];
}

CollisionManager.prototype.register = function(obj, shape) {
	this.collidables.push({object:obj, shape:shape});
}

CollisionManager.prototype.unregister = function(obj) {
	for (var i = 0; i < this.collidables.length; i++) {
		if (obj.id == this.collidables[i].object.object.id) {
			this.collidables.splice(i, 1);
			break;
		}
	}
}

CollisionManager.prototype.checkCollisions = function() {
	for (var i = 0; i < this.collidables.length; i++) {
		var obj1 = this.collidables[i].object;
		if (!obj1.shape)
			continue;
		for (var j = i+1; j < this.collidables.length; j++) {
			var obj2 = this.collidables[j].object;
			if (!obj2.shape)
				continue;
			var radius = obj1.shape.getRadius()+obj2.shape.getRadius();
			var pos1 = obj1.shape.getPosition();
			var pos2 = obj2.shape.getPosition();
			if (radius >= vectorLength(vectorDifference(pos1, pos2))) {
				obj1.object.broadcast(new Message('collide', { other: obj2.object }, this));
				obj2.object.broadcast(new Message('collide', { other: obj1.object }, this));
			}
		}
	}
}

