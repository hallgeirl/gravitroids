var objectCounter = 0;

//game objects
function GameObject(game) {
	this.game = game;
	this.components = [];
	this.alive = true;
	this.id = objectCounter;
	objectCounter++;

    this.messageChannels = {};
    this.componentMap = {};
}

GameObject.prototype.addComponent = function(component) {
	this.components.push(component);
	component.owner = this;
    this.componentMap[component.type] = component;
	//this.components.sort(function(comp) { return comp.sequence; });

    var messageSinks = component.getHandledMessages();
    for (var i = 0; i < messageSinks.length; i++) {
        if (!this.messageChannels[messageSinks[i]])
            this.messageChannels[messageSinks[i]] = [];
        
        this.messageChannels[messageSinks[i]].push(component);
    }
}

GameObject.prototype.getComponent = function(name) {
    return this.componentMap[name];
}

GameObject.prototype.broadcast = function(message, sender) {
    var channel = this.messageChannels[message.subject];
    if (channel) {
        for (var i = 0; i < channel.length; i++) {
            channel[i].receiveMessage(message, sender);
        }
    }

	if (message.subject == 'kill' || message.subject == 'score') {
		this.alive = false;
        this.game.receiveMessage(message);
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

