/*
Components
*/
function Component(config, messageDispatcher) {
	this.owner = null;
    this.messageDispatcher = messageDispatcher;
}

Component.prototype.receiveMessage = function(message) {}
Component.prototype.update = function(frameTime) {}
Component.prototype.initialize = function() {
}

Component.prototype.getHandledMessages = function() { 
    return [];
}

//spatial component
function SpatialComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = config.position;
	this.velocity = config.velocity;
}

SpatialComponent.prototype = new Component();
SpatialComponent.prototype.update = function(frameTime) {
	this.position.x += this.velocity.x * frameTime;
	this.position.y += this.velocity.y * frameTime;

	this.owner.broadcast(new Message('move', { x: this.position.x, y: this.position.y }, this));
	this.owner.broadcast(new Message('speed', { x: this.velocity.x, y: this.velocity.y }, this));
}

SpatialComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'accel') {
		this.velocity.x += message.data.x;
		this.velocity.y += message.data.y;
	}
}

SpatialComponent.prototype.getHandledMessages = function() { 
    return ['accel'];
}

//gravity component
function GravityComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.gravity = config.magnitude;
}

GravityComponent.prototype = new Component();
GravityComponent.prototype.update = function(frameTime) {
	this.owner.broadcast(new Message('accel', { x: 0, y: -this.gravity*frameTime }));
}

//Renderer component
function ShapeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.shape = ShapeComponent.createShape(config.shape, config.shapemap, config);
	this.rotationOffset = config.rotation;
    if (!this.rotationOffset)
        this.rotationOffset = 0;
}

ShapeComponent.createShape = function(shapeConfig, shapeMap, config) {
    if (config.position)
        shapeConfig.position = config.position;
    return new shapeMap[shapeConfig.type](shapeConfig);
}

ShapeComponent.prototype = new Component();
ShapeComponent.prototype.initialize = function(){
	this.owner.broadcast(new Message('shape', this.shape, this));
}

ShapeComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'move')
		this.shape.setPosition(message.data.x, message.data.y);
	else if (message.subject == 'rotate') 
		this.shape.setRotation(-message.data-this.rotationOffset);
    else if (message.subject == 'size')
        this.shape.setRadius(message.data);
}

ShapeComponent.prototype.getHandledMessages = function() { 
    return ['move', 'rotate', 'size'];
}

ShapeComponent.prototype.update = function(frametime) {
    this.messageDispatcher.sendMessage(new Message('render', this.shape));
}

function ControllerComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.pressed = {};
    this.mouse = { left: false, right: false, position: {x:0, y:0}};
	var that = this;
	window.addEventListener('keydown', function(evt) { 
		that.pressed[evt.keyCode] = true;
	});
	window.addEventListener('keyup', function(evt) { 
		that.pressed[evt.keyCode] = false;
	});
    window.addEventListener('mousedown', function (evt) {
        if (evt.button == 0)
            that.mouse.left = true;
        else if (evt.button == 2)
            that.mouse.right = true;
    });
    window.addEventListener('mouseup', function (evt) {
        if (evt.button == 0)
            that.mouse.left = false;
        else if (evt.button == 2)
            that.mouse.right = false;
    });
    window.addEventListener('touchstart', function(evt) {
        that.mouse.left = true;
    });
    window.addEventListener('touchend', function(evt) {
        that.mouse.left = false;
    });
}

ControllerComponent.prototype = new Component();
ControllerComponent.prototype.update = function(frameTime) {
    if (this.mouse.left){
        this.owner.broadcast(new Message('control', { button: 'mouseleft', position: this.mouse.position }));
    }
    if (this.mouse.right){
        this.owner.broadcast(new Message('control', { button: 'mouseright', position: this.mouse.position }));
    }
	if (this.pressed[38]) {
		this.owner.broadcast(new Message('control', { button: 'up' }, this));
	}
	if (this.pressed[40]) {
		this.owner.broadcast(new Message('control', { button: 'down' }, this));
	}
	if (this.pressed[37]) {
		this.owner.broadcast(new Message('control', { button: 'left' }, this));
	}
	if (this.pressed[39]) {
		this.owner.broadcast(new Message('control', { button: 'right' }, this));
	}
	if (this.pressed[17]) {
		this.owner.broadcast(new Message('control', { button: 'ctrl' }, this));
	}
}
ControllerComponent.prototype.receiveMessage = function(message) {
    if (message.subject == 'mousemove') {
        this.mouse.position = message.data;
    }
}

ControllerComponent.prototype.getHandledMessages = function() { 
    return ['mousemove'];
}


function AccelleratorComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.accel = {x: 0, y:0};
	this.position = {x:0, y:0};
	this.magnitude = config.magnitude;
	this.rotation = 0;
}

AccelleratorComponent.prototype = new Component();
AccelleratorComponent.prototype.update = function(frameTime) {
    if (this.accel.x == 0 && this.accel.y == 0)
        return;

	this.owner.broadcast(new Message('accel', {x: this.accel.x*frameTime, y:this.accel.y*frameTime, trigger:'control'}, this))
	this.accel.x = this.accel.y = 0;
}

AccelleratorComponent.prototype.receiveMessage = function(message) {
    if (message.subject == 'control') {
		var dirX = Math.cos(this.rotation);
		var dirY = -Math.sin(this.rotation);
		switch (message.data.button) {
			case 'down':
				dirY = -dirY;
				dirX = -dirX;
            case 'mouseright':
			case 'up':
				this.accel.x = dirX*this.magnitude;
				this.accel.y = dirY*this.magnitude;
				break;
		}
	} else if (message.subject == 'move') {
		this.position.x = message.data.x;
		this.position.y = message.data.y;
	} else if (message.subject == 'rotate') {
		this.rotation = message.data;
	}
}

AccelleratorComponent.prototype.getHandledMessages = function() { 
    return ['move', 'control', 'rotate'];
}

function FrictionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.magnitude = config.friction;
	this.velocity = {x:0, y:0};
}

FrictionComponent.prototype = new Component();
FrictionComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'speed') {
		this.velocity.x = message.data.x;
		this.velocity.y = message.data.y;
	}
}

FrictionComponent.prototype.getHandledMessages = function() { 
    return ['speed'];
}

FrictionComponent.prototype.update = function(frameTime) {
	var x, y;
	
	if (this.velocity.x == 0 && this.velocity.y == 0) 
		return;
	
	var direction = vectorInvert(vectorNormalize(this.velocity));
	if (this.velocity.x > 0)
		x = Math.max(direction.x*this.magnitude*frameTime, -this.velocity.x);
	else
		x = Math.min(direction.x*this.magnitude*frameTime, -this.velocity.x);
	
	if (this.velocity.y > 0)
		y = Math.max(direction.y*this.magnitude*frameTime, -this.velocity.y);
	else
		y = Math.min(direction.y*this.magnitude*frameTime, -this.velocity.y);
	
	this.owner.broadcast(new Message('accel', {x: x, y:y}, this));
}

function LifetimeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.lifetime = config.lifetime;
}

LifetimeComponent.prototype = new Component();
LifetimeComponent.prototype.update = function(frameTime) {
	this.lifetime -= frameTime;
	if (this.lifetime <= 0) {
		this.owner.broadcast(new Message('kill',null,this));
	}
}

function RotationComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.angle = config.initial;
	this.angleDiff = 0;
	this.rotationSpeed = config.speed;
    this.position = {x:0, y:0};
}

RotationComponent.prototype = new Component();
RotationComponent.prototype.initialize = function() {
	this.owner.broadcast(new Message('rotate', this.angle, this));
}

RotationComponent.prototype.receiveMessage = function(message) {
	
	if (message.subject == 'control') {
	
		switch (message.data.button) {
			case 'left':
				this.angleDiff = this.rotationSpeed;
				break;
			case 'right':
				this.angleDiff = -this.rotationSpeed;
				break;
            case 'mouseright':
            case 'mouseleft':
                var direction = vectorNormalize(vectorDifference(message.data.position, this.position));
                var angle = getAngleFromDirection(direction);
                this.angleDiff = angle - this.angle;
                break;
		}
	} else if (message.subject == 'move') {
        this.position = message.data;
    }
}

RotationComponent.prototype.getHandledMessages = function() { 
    return ['control', 'move'];
}

RotationComponent.prototype.update = function(frameTime) {
	if (this.angleDiff == 0) 
		return;
	
	this.angle += this.angleDiff;

	while (this.angle < 0) 
		this.angle += 2*Math.PI;
	
	while (this.angle > 2*Math.PI)
		this.angle -= 2*Math.PI;
	
	this.angleDiff = 0;	
	this.owner.broadcast(new Message('rotate', this.angle, this));
}

function ExhaustComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x:0, y:0};
	this.velocity = {x:0, y:0};
	this.nparticles = config.pipes;
	this.rotation = 0;
    this.timer = new Date().getTime();
}

ExhaustComponent.prototype = new Component();

ExhaustComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'speed') {
		this.velocity = message.data;
	} else if (message.subject == 'rotate') {
		this.rotation = message.data;
	} else if (message.subject == 'move') {
		this.position = message.data;
	} else if (message.subject == 'accel' && message.data.trigger == 'control') {
        var direction = vectorInvert(vectorNormalize(this.velocity));
        var exhaustDirection = getDirectionFromAngle(this.rotation);
        var position = {x:this.position.x-exhaustDirection.x*10, y:this.position.y-exhaustDirection.y*10};
        if (new Date().getTime() - this.timer >= 10/this.nparticles) {
            this.timer = new Date().getTime();
            this.messageDispatcher.sendMessage(new Message('create-particle', { position: position, 
                    angle: this.rotation-Math.PI, 
                    speed: vectorLength(this.velocity)+100, 
                    size: Math.random()*5, 
                    ownerVelocity: this.velocity,
                    lifetime: 0.5, 
                    randomizeAngle: Math.PI/4}));
        }
    }
}

ExhaustComponent.prototype.getHandledMessages = function() { 
    return ['speed', 'rotate', 'move', 'accel'];
}

function AsteroidSizeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x: 0, y:0};
	this.size = config.size;
	this.health = config.size*500;
}

AsteroidSizeComponent.prototype = new Component();
AsteroidSizeComponent.prototype.initialize = function() {
    this.owner.broadcast(new Message('size', this.size*25, this));
}

AsteroidSizeComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'kill') {
		if ((message.data == null || message.data.mode != 'final') && this.size > 1) {
			for (var i = 0; i < 2; i++) {
	            var velocity = getDirectionFromAngle(Math.random()*2*Math.PI);
            	velocity = vectorScale(velocity, 200);

				this.messageDispatcher.sendMessage(new Message('spawn', { type: 'asteroid', config: { position: this.position, size: this.size-1, velocity: velocity, points: 100*(this.size-1) }}, this));
			}
		}
	} else if (message.subject == 'move') {
		this.position = message.data;
	} else if (message.subject == 'collide') {
		if (message.data.other.type == 'bullet') 
			this.health -= 100;
	}
}

AsteroidSizeComponent.prototype.getHandledMessages = function() { 
    return ['kill', 'move', 'collide'];
}

AsteroidSizeComponent.prototype.update = function(frameTime) {
	if (this.health <= 0) {
		this.owner.broadcast(new Message('kill', null, this));
	}
}

function ContinuousRotationComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.direction = config.direction;
	if (!this.direction)
		this.direction = 1;
}

ContinuousRotationComponent.prototype = new Component();
ContinuousRotationComponent.prototype.update = function(frameTime) {
	if (this.direction > 0)
		this.owner.broadcast(new Message('control', { button: 'right' }, this));	
	else
		this.owner.broadcast(new Message('control', { button: 'left' }, this));	
}

function GunComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.barrels = config.barrels;
	this.position = {x: 0, y:0};
	this.rotation = 0;
	this.fire = false;
	this.cooldown = 0.05;
	this.cooldownTimer = 0;
	this.spread = config.spread;
}

GunComponent.prototype = new Component();
GunComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'move') {
		this.position = message.data;
	} else if (message.subject == 'rotate') {
		this.rotation = message.data;
	} else if (message.subject == 'control' && (message.data.button == 'ctrl' || message.data.button == 'mouseleft')) {
		this.fire = true;
	}
}

GunComponent.prototype.getHandledMessages = function() { 
    return ['move', 'rotate', 'control'];
}

GunComponent.prototype.update = function(frameTime) {
	this.cooldownTimer -= frameTime;
	
	if (this.fire && this.cooldownTimer <= 0) {
        for (var i = 0; i < this.barrels; i++) {
	        var finalAngle = this.rotation+this.spread*Math.random()-this.spread/2;
            this.messageDispatcher.sendMessage(new Message('spawn', { type: 'bullet', config: { position: this.position, velocity: vectorScale(getDirectionFromAngle(finalAngle),800), initial: finalAngle}}, this));
        }
		this.cooldownTimer = this.cooldown;		
	}
	
	this.fire = false;
}

function DestroyOutOfBoundsComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x: 0, y:0};
}

DestroyOutOfBoundsComponent.prototype = new Component();
DestroyOutOfBoundsComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'move') {
		this.position = message.data;
	}
}

DestroyOutOfBoundsComponent.prototype.getHandledMessages = function() { 
    return ['move'];
}

DestroyOutOfBoundsComponent.prototype.update = function(frameTime) {
	if (this.position.x < -200 || this.position.x > this.owner.stage.stageWidth + 200 || 
	    this.position.y < -200 || this.position.y > this.owner.stage.stageHeight + 200) {
		this.owner.broadcast(new Message('kill', { mode: 'final' }, this));
	}
	
}

function CollisionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x: 0, y:0};
	this.shape = null;
}

CollisionComponent.prototype = new Component();

CollisionComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'shape') {
		this.shape = message.data;
		this.messageDispatcher.sendMessage(new Message('unregister-collision-target', this.owner));
		this.messageDispatcher.sendMessage(new Message('register-collision-target', {shape: this.shape, object: this.owner}));
	} else if (message.subject == 'kill') {
		this.messageDispatcher.sendMessage(new Message('unregister-collision-target', this.owner));
	}
}

CollisionComponent.prototype.getHandledMessages = function() { 
    return ['shape', 'kill'];
}

CollisionComponent.prototype.update = function(frameTime) {
	
}

function DieOnCollisionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
}

DieOnCollisionComponent.prototype = new Component();

DieOnCollisionComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'collide' && this.owner.type != message.data.other.type && this.owner.type == 'bullet') { 
		this.owner.broadcast(new Message('kill', null, this));
	}
}

DieOnCollisionComponent.prototype.getHandledMessages = function() { 
    return ['collide'];
}

function ExplodeOnKillComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.particleSize = config.particlesize;
	this.particleCount = config.particlecount;
	this.explosionSize = config.size;
	this.position = {x:0, y:0};
}

ExplodeOnKillComponent.prototype = new Component();

ExplodeOnKillComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'kill' && (message.data == null || message.data.mode != 'final')) { 
		for (var i = 0; i < this.particleCount; i++) {
            this.messageDispatcher.sendMessage(new Message('create-particle', { position: this.position, 
                                                           angle: 0, 
                                                           speed: this.particleSize*50*(Math.random()+0.5), 
                                                           size: Math.random()*this.particleSize, 
                                                           lifetime: this.explosionSize, 
                                                           randomizeAngle: Math.PI*2}));
		}
	} else if (message.subject == 'move') {
		this.position = message.data;
	}
}

ExplodeOnKillComponent.prototype.getHandledMessages = function() { 
    return ['kill', 'move'];
}

function DieOnAsteroidCollisionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
}

DieOnAsteroidCollisionComponent.prototype = new Component();

DieOnAsteroidCollisionComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'collide' && message.data.other.type == 'asteroid') { 
		this.owner.broadcast(new Message('kill', null, this));
	}
}

DieOnAsteroidCollisionComponent.prototype.getHandledMessages = function() { 
    return ['collide'];
}

function SizeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.size = config.size;
}

SizeComponent.prototype = new Component();
SizeComponent.prototype.initialize = function() {
    this.owner.broadcast(new Message('size', this.size, this));
}

function PointsComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.points = config.points;
}

PointsComponent.prototype = new Component();
PointsComponent.prototype.receiveMessage = function(message) {
    if (message.subject == 'kill' && (!message.data || message.data.mode == null || message.data.mode != 'final')) 
        this.messageDispatcher.sendMessage(new Message('score', this.points, this));
}

PointsComponent.prototype.getHandledMessages = function() { 
    return ['kill'];
}
