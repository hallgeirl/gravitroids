function CollisionManager(messageDispatcher) {
	this.collidables = [];
    this.messageDispatcher = messageDispatcher;
    this.messageDispatcher.registerHandler('register-collision-target', this);
    this.messageDispatcher.registerHandler('unregister-collision-target', this);
}

CollisionManager.prototype.receiveMessage = function(message) {
    if (message.subject == 'unregister-collision-target')
        this.unregister(message.data);
    else if (message.subject == 'register-collision-target') 
        this.register(message.data);
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
    this.sortObjects();
	for (var i = 0; i < this.collidables.length; i++) {
		var obj1 = this.collidables[i].object;
		if (!obj1.shape)
			continue;

        var bottom1 = obj1.shape.getPosition().y + obj1.shape.getRadius();

		for (var j = i+1; j < this.collidables.length; j++) {
			var obj2 = this.collidables[j].object;
			if (!obj2.shape)
				continue;
            var top2 = obj2.shape.getPosition().y - obj2.shape.getRadius();
            if (bottom1 < top2)
                break;
			var radius = obj1.shape.getRadius()+obj2.shape.getRadius();
			var pos1 = obj1.shape.getPosition();
			var pos2 = obj2.shape.getPosition();
			if (radius >= vectorLength(vectorDifference(pos1, pos2))) {
				this.messageDispatcher.sendMessage(new Message('collide', { other: obj2.object }, this), obj1.object.id);
				this.messageDispatcher.sendMessage(new Message('collide', { other: obj1.object }, this), obj2.object.id);
			}
		}
	}
}

function objectCompare(obj1, obj2) {
    var top1 = obj1.object.shape.getPosition().y - obj1.object.shape.getRadius();
    var top2 = obj2.object.shape.getPosition().y - obj2.object.shape.getRadius();
    return top2-top1;
}

CollisionManager.prototype.sortObjects = function(frameTime)
{
    for (var i = 1; i < this.collidables.length; i++)
    {
        var obj1 = this.collidables[i];
        var top1 = obj1.object.shape.getPosition().y - obj1.object.shape.getRadius();
        var j = i - 1;
        var done = false;

        do
        {
            var obj2 = this.collidables[j];
            var top2 = obj2.object.shape.getPosition().y - obj2.object.shape.getRadius();
            if (top1 < top2)
            {
                this.collidables[j+1] = this.collidables[j];
                j--;
                if (j < 0)
                    done = true;
            }
            else 
                done = true;
        } while (!done);

        this.collidables[j+1] = obj1;
    }
}
