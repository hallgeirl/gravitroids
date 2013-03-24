var objectCounter = 1;

//game objects
function GameObject(stage, messageDispatcher) {
    this.stage = stage;
    this.messageDispatcher = messageDispatcher;
	this.components = [];
	this.alive = true;
	this.id = objectCounter;
	objectCounter++;

    this.messageChannels = {};
    this.componentMap = {};
    this.messageDispatcher.registerHandler('kill', this, this.id);
}

GameObject.prototype.addComponent = function(component) {
	this.components.push(component);
	component.owner = this;
    this.componentMap[component.type] = component;
}

GameObject.prototype.getComponent = function(name) {
    return this.componentMap[name];
}

GameObject.prototype.receiveMessage = function(message, sender) {
    if (message.subject == 'kill') 
        this.alive = false;
}


GameObject.prototype.update = function(frameTime) {
	for (var i = 0; i < this.components.length; i++) {
		this.components[i].update(frameTime);
	}
}

GameObject.prototype.initialize = function() {
	for (var i = 0; i < this.components.length; i++) {
		this.components[i].initialize(this.messageDispatcher);
	}
}

