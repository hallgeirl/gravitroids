/*
Components
*/
function Component(config, messageDispatcher) {
    if (!config)
        return;

	this.owner = null;
    this.messageDispatcher = messageDispatcher;
    this.messageTag = config.messageTag;
}

Component.prototype.receiveMessage = function(message) {}
Component.prototype.update = function(frameTime) {}
Component.prototype.initialize = function() {
}

Component.prototype.getHandledMessages = function() { 
    return [];
}

Component.prototype.registerMessage = function(subject, tag) {
    if (typeof(tag) == 'undefined')
        tag = this.messageTag;

    this.messageDispatcher.registerHandler(subject, this, tag);
}

Component.prototype.sendMessage = function(message, tag) {
    if (typeof(tag) == 'undefined')
        tag = this.messageTag;

    this.messageDispatcher.sendMessage(message, tag);
}

//spatial component
function SpatialComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = config.position;
	this.velocity = config.velocity;
    messageDispatcher.registerHandler('accel', this, this.messageTag);
}

SpatialComponent.prototype = new Component();
SpatialComponent.prototype.update = function(frameTime) {
	this.position.x += this.velocity.x * frameTime;
	this.position.y += this.velocity.y * frameTime;

	this.sendMessage(new Message('move', { x: this.position.x, y: this.position.y }, this));
	this.sendMessage(new Message('speed', { x: this.velocity.x, y: this.velocity.y }, this));
}

SpatialComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'accel') {
		this.velocity.x += message.data.x;
		this.velocity.y += message.data.y;
	}
}

//gravity component
function GravityComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.gravity = config.magnitude;
}

GravityComponent.prototype = new Component();
GravityComponent.prototype.update = function(frameTime) {
	this.sendMessage(new Message('accel', { x: 0, y: -this.gravity*frameTime }));
}

//Renderer component
function ShapeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.shape = ShapeComponent.createShape(config.shape, config.shapemap, config);
	this.rotationOffset = config.rotation;
    if (!this.rotationOffset)
        this.rotationOffset = 0;

    this.registerMessage('move');
    this.registerMessage('rotate');
    this.registerMessage('size');
}

ShapeComponent.createShape = function(shapeConfig, shapeMap, config) {
    if (config.position)
        shapeConfig.position = config.position;
    return new shapeMap[shapeConfig.type](shapeConfig);
}

ShapeComponent.prototype = new Component();
ShapeComponent.prototype.initialize = function(){
	this.sendMessage(new Message('shape', this.shape, this));
}

ShapeComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'move')
		this.shape.setPosition(message.data.x, message.data.y);
	else if (message.subject == 'rotate') 
		this.shape.setRotation(-message.data-this.rotationOffset);
    else if (message.subject == 'size')
        this.shape.setRadius(message.data);
}

ShapeComponent.prototype.update = function(frametime) {
    this.sendMessage(new Message('render', this.shape), null);
}

function ControllerComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.registerMessage('mousemove', null);

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
        this.sendMessage(new Message('control', { button: 'mouseleft', position: this.mouse.position }));
    }
    if (this.mouse.right){
        this.sendMessage(new Message('control', { button: 'mouseright', position: this.mouse.position }));
    }
	if (this.pressed[38]) {
		this.sendMessage(new Message('control', { button: 'up' }, this));
	}
	if (this.pressed[40]) {
		this.sendMessage(new Message('control', { button: 'down' }, this));
	}
	if (this.pressed[37]) {
		this.sendMessage(new Message('control', { button: 'left' }, this));
	}
	if (this.pressed[39]) {
		this.sendMessage(new Message('control', { button: 'right' }, this));
	}
	if (this.pressed[17]) {
		this.sendMessage(new Message('control', { button: 'ctrl' }, this));
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

    this.registerMessage('control');
    this.registerMessage('move');
    this.registerMessage('rotate');
    this.registerMessage('mousemove', null);
}

AccelleratorComponent.prototype = new Component();
AccelleratorComponent.prototype.update = function(frameTime) {
    if (this.accel.x == 0 && this.accel.y == 0)
        return;

	this.sendMessage(new Message('accel', {x: this.accel.x*frameTime, y:this.accel.y*frameTime, trigger:'control'}));
	this.accel.x = this.accel.y = 0;
}

AccelleratorComponent.prototype.receiveMessage = function(message) {
    if (message.subject == 'control') {
		var dirX = Math.cos(this.rotation);
		var dirY = -Math.sin(this.rotation);
		switch (message.data.button) {
			case 'up':
				this.accel.y = -this.magnitude;
				break;
            case 'down':
                this.accel.y = this.magnitude;
                break;
            case 'left':
                this.accel.x = -this.magnitude;
                break;
            case 'right':
                this.accel.x = this.magnitude;
                break;
		}
	} else if (message.subject == 'move') {
		this.position.x = message.data.x;
		this.position.y = message.data.y;
	} else if (message.subject == 'rotate') {
		this.rotation = message.data;
	} else if (message.subject == 'mousemove') {
        
    }
}

function FrictionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.magnitude = config.friction;
	this.velocity = {x:0, y:0};
    this.registerMessage('speed');
}

FrictionComponent.prototype = new Component();
FrictionComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'speed') {
		this.velocity.x = message.data.x;
		this.velocity.y = message.data.y;
	}
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
	
	this.sendMessage(new Message('accel', { x: x, y: y }, this));
}

function LifetimeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.lifetime = config.lifetime;
}

LifetimeComponent.prototype = new Component();
LifetimeComponent.prototype.update = function(frameTime) {
	this.lifetime -= frameTime;
	if (this.lifetime <= 0) {
		this.sendMessage(new Message('kill',null,this));
	}
}

function RotationComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.angle = config.initial;
	this.angleDiff = 0;
	this.rotationSpeed = config.speed;
    this.position = {x:0, y:0};
    this.registerMessage('control');
    this.registerMessage('move');
    this.registerMessage('rotate-left');
    this.registerMessage('rotate-right');
}

RotationComponent.prototype = new Component();
RotationComponent.prototype.initialize = function() {
	this.sendMessage(new Message('rotate', this.angle, this));
}

RotationComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'control') {
		switch (message.data.button) {
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
    else if (message.subject = 'rotate-left') {
        this.angleDiff = this.rotationSpeed;
	} else if (message.subject = 'rotate-right') {
        this.angleDiff = -this.rotationSpeed;
    }
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
	this.sendMessage(new Message('rotate', this.angle, this));
}

function ExhaustComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x:0, y:0};
	this.velocity = {x:0, y:0};
	this.nparticles = config.pipes;
	this.rotation = 0;
    this.timer = new Date().getTime();
    this.registerMessage('accel');
    this.registerMessage('speed');
    this.registerMessage('rotate');
    this.registerMessage('move');
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
        var direction = vectorInvert(vectorNormalize(message.data));
        var angle = getAngleFromDirection(direction);
        if (new Date().getTime() - this.timer >= 10/this.nparticles) {
            this.timer = new Date().getTime();
            this.messageDispatcher.sendMessage(new Message('create-particle', { position: this.position, 
                    angle: angle, 
                    speed: vectorLength(this.velocity)+100, 
                    size: Math.random()*5, 
                    ownerVelocity: {x:0, y:0},
                    lifetime: 0.5, 
                    randomizeAngle: Math.PI/4}));
        }
    }
}

function AsteroidSizeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x: 0, y:0};
	this.size = config.size;
	this.health = config.size*400;
    this.registerMessage('kill');
    this.registerMessage('move');
    this.registerMessage('collide');
}

AsteroidSizeComponent.prototype = new Component();
AsteroidSizeComponent.prototype.initialize = function() {
    this.sendMessage(new Message('size', this.size*25, this));
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

AsteroidSizeComponent.prototype.update = function(frameTime) {
	if (this.health <= 0) {
		this.sendMessage(new Message('kill', null, this));
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
		this.sendMessage(new Message('rotate-right', { button: 'right' }, this));	
	else
		this.sendMessage(new Message('rotate-left', { button: 'left' }, this));	
}

function GunComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x: 0, y:0};
	this.rotation = 0;
	this.fire = false;
	this.cooldownTimer = 0;
    this.sound = config.sound;
    this.registerMessage('move');
    this.registerMessage('rotate');
    this.registerMessage('control');
    this.registerMessage('set-weapon-level');
    this.levels = config.levels;
    this.setWeaponLevel(0);
}

GunComponent.prototype = new Component();
GunComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'move') {
		this.position = message.data;
	} else if (message.subject == 'rotate') {
		this.rotation = message.data;
	} else if (message.subject == 'control' && (message.data.button == 'ctrl' || message.data.button == 'mouseleft')) {
		this.fire = true;
	} else if (message.subject == 'set-weapon-level') {
        this.setWeaponLevel(message.data-1);
    }
}

GunComponent.prototype.setWeaponLevel = function(level) {
    if (level >= this.levels.length)
        level = this.levels.length-1;

	this.cooldown = this.levels[level].cooldown;
	this.spread = this.levels[level].spread;
    this.barrels = this.levels[level].barrels;
}

GunComponent.prototype.update = function(frameTime) {
	this.cooldownTimer -= frameTime;
	
	if (this.fire && this.cooldownTimer <= 0) {
        for (var i = 0; i < this.barrels; i++) {
	        var finalAngle = this.rotation+this.spread*Math.random()-this.spread/2;
            this.messageDispatcher.sendMessage(new Message('spawn', { type: 'bullet', config: { position: this.position, velocity: vectorScale(getDirectionFromAngle(finalAngle),800), initial: finalAngle}}, this));
        }
        if (this.sound)
            this.messageDispatcher.sendMessage(new Message('play-sound', this.sound));
		this.cooldownTimer = this.cooldown;		
	}
	
	this.fire = false;
}

function DestroyOutOfBoundsComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x: 0, y:0};
    this.registerMessage('move');
}

DestroyOutOfBoundsComponent.prototype = new Component();
DestroyOutOfBoundsComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'move') {
		this.position = message.data;
	}
}

DestroyOutOfBoundsComponent.prototype.update = function(frameTime) {
	if (this.position.x < -200 || this.position.x > this.owner.stage.stageWidth + 200 || 
	    this.position.y < -200 || this.position.y > this.owner.stage.stageHeight + 200) {
		this.sendMessage(new Message('kill', { mode: 'final' }, this));
	}
	
}

function CollisionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.position = {x: 0, y:0};
	this.shape = null;
    this.registerMessage('shape');
    this.registerMessage('kill');
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

CollisionComponent.prototype.update = function(frameTime) {
	
}

function DieOnCollisionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.registerMessage('collide');
}

DieOnCollisionComponent.prototype = new Component();

DieOnCollisionComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'collide' && this.owner.type != message.data.other.type && this.owner.type == 'bullet') { 
		this.sendMessage(new Message('kill', null, this));
	}
}

function ExplodeOnKillComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
	this.particleSize = config.particlesize;
	this.particleCount = config.particlecount;
	this.explosionSize = config.size;
	this.position = {x:0, y:0};
    this.sound = config.sound;
    this.registerMessage('kill');
    this.registerMessage('move');
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
        if (this.sound)
            this.messageDispatcher.sendMessage(new Message('play-sound', this.sound));
	} else if (message.subject == 'move') {
		this.position = message.data;
	}
}

function DieOnAsteroidCollisionComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.registerMessage('collide');
}

DieOnAsteroidCollisionComponent.prototype = new Component();

DieOnAsteroidCollisionComponent.prototype.receiveMessage = function(message) {
	if (message.subject == 'collide' && message.data.other.type == 'asteroid') { 
		this.sendMessage(new Message('kill', null, this));
	}
}

function SizeComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.size = config.size;
}

SizeComponent.prototype = new Component();
SizeComponent.prototype.initialize = function() {
    this.sendMessage(new Message('size', this.size, this));
}

function PointsComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.points = config.points;
    this.registerMessage('kill');
}

PointsComponent.prototype = new Component();
PointsComponent.prototype.receiveMessage = function(message) {
    if (message.subject == 'kill' && (!message.data || message.data.mode == null || message.data.mode != 'final')) 
        this.sendMessage(new Message('score', this.points, this));
}

function WeaponLevelComponent(config, messageDispatcher) {
    Component.call(this, config, messageDispatcher);
    this.level = 1;
    this.experience = 0;
    this.registerMessage('score', null);
    this.updateExperienceAndLevel();
}

WeaponLevelComponent.prototype = new Component();
WeaponLevelComponent.prototype.receiveMessage = function(message) {
    if (message.subject == 'score') {
        this.experience += message.data;
        this.updateExperienceAndLevel();
    }
}

WeaponLevelComponent.prototype.updateExperienceAndLevel = function() {
    if (this.experience >= this.targetExperience) {
        this.experience -= this.targetExperience;
        this.level ++;
        this.sendMessage(new Message('set-weapon-level', this.level));
    }
    this.targetExperience = 1000*Math.pow(2,this.level-1);
    this.sendMessage(new Message('experience', { currentXP: this.experience, targetXP: this.targetExperience }));
}

