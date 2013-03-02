var objectCounter = 0;

//game objects
function GameObject(game) {
	this.game = game;
	this.components = [];
	this.alive = true;
	this.id = objectCounter;
	objectCounter++;

    this.messageChannels = {};
}

GameObject.prototype.addComponent = function(component) {
	this.components.push(component);
	component.owner = this;
	this.components.sort(function(comp) { return comp.sequence; });
}

GameObject.prototype.broadcast = function(message, sender) {
	for (var i = 0; i < this.components.length; i++) {
		this.components[i].receiveMessage(message, sender)
	}
	
	if (message.subject == 'kill' || message.subject == 'score') {
		this.alive = false;
        this.game.tell(message);
	}
}

GameObject.prototype.update = function(frameTime) {
	for (var i = 0; i < this.components.length; i++) {
		this.components[i].update(frameTime);
	}
}

GameObject.prototype.initialize = function() {
	for (var i = 0; i < this.components.length; i++) {
		this.components[i].initialize();
	}
}

