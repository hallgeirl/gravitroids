function ObjectFactory(game, objectLayers) {
	this.objectLayers = objectLayers;
	this.game = game;
    this.componentMap = {}

    this.componentMap['shape'] = ShapeComponent;
    this.componentMap['spatial'] = SpatialComponent;
    this.componentMap['controller'] = ControllerComponent;
    this.componentMap['accellerator'] = AccelleratorComponent;
    this.componentMap['gravity'] = GravityComponent;
    this.componentMap['exhaust'] = ExhaustComponent;
    this.componentMap['rotation'] = RotationComponent;
    this.componentMap['gun'] = GunComponent;
    this.componentMap['collision'] = CollisionComponent;
    this.componentMap['explodeonkill'] = ExplodeOnKillComponent;
    this.componentMap['dieonasteroidcollision'] = DieOnAsteroidCollisionComponent;
    this.componentMap['destroyoutofbounds'] = DestroyOutOfBoundsComponent;
    this.componentMap['asteroidsize'] = AsteroidSizeComponent;
    this.componentMap['continuousrotation'] = ContinuousRotationComponent;
    this.componentMap['friction'] = FrictionComponent;
    this.componentMap['lifetime'] = LifetimeComponent;
    this.componentMap['size'] = SizeComponent;
    this.componentMap['points'] = PointsComponent;
    
    this.shapeMap = {}
    this.shapeMap['wedge'] = Kinetic.Wedge;
    this.shapeMap['regularpolygon'] = Kinetic.RegularPolygon;
    this.shapeMap['circle'] = Kinetic.Circle;
}

ObjectFactory.prototype.createObject = function(template, config) {
    var go = new GameObject(this.game);
    go.type = template.type;

    for (var i = 0; i < template.components.length; i++)
        go.addComponent(this.createComponent(template.components[i], config));

    go.initialize();
    
    return go;
}

ObjectFactory.prototype.createComponent = function(template, config) {
    var finalTemplate = ObjectFactory.getFinalComponentConfig(template, config);
    
    finalTemplate['shapemap'] = this.shapeMap;
    finalTemplate['layer'] = this.objectLayers[Math.floor(Math.random()*this.objectLayers.length)];
    var component = new this.componentMap[template.type](finalTemplate);
    component.type = template.type;

    return component;
}

ObjectFactory.getFinalComponentConfig = function (template, config) {
    var finalObject = clone(template);
    for (var prop in config) {
        finalObject[prop] = clone(config[prop]);
    }
    for (var prop in finalObject) {
        if (typeof(finalObject[prop]) == 'string' && finalObject[prop][0] == '$')
            eval('finalObject[prop] = ' + finalObject[prop].substring(1));
    }

    return finalObject;
}


ObjectFactory.prototype.createAsteroid = function(position, size) {
	var go = new GameObject(this.game);
	go.type = 'asteroid';
	go.scoreValue = size*100;
	
	var poly = new Kinetic.RegularPolygon({
		x: position.x, y: position.y,
		sides: Math.floor((Math.random()*10)+5), radius: size*25,
		fill: 'gray',
		stroke: 'black',
		strokeWidth: 2
	});

	this.objectLayer.add(poly);
	var velocity = getDirectionFromAngle(Math.random()*2*Math.PI);
	velocity = vectorScale(velocity, 100);
	go.addComponent(new SpatialComponent({ position: position, velocity: velocity }));
	go.addComponent(new GravityComponent({ magnitude: -98.8 }));
	go.addComponent(new AsteroidSizeComponent({ size: size }));
	go.addComponent(new ShapeComponent({ shape: poly }));
	go.addComponent(new RotationComponent({ initial: Math.PI/2.0, speed: 0.1 }));
	go.addComponent(new ContinuousRotationComponent({ direction: Math.random()-0.5 }));
	go.addComponent(new DestroyOutOfBoundsComponent());
	go.addComponent(new CollisionComponent());
	go.addComponent(new ExplodeOnKillComponent({ particlesize: size*5, particlecount: size*5, size: 0.5 }));
	go.initialize();
	
	this.game.objects.push(go);
	
	return go;
}

ObjectFactory.prototype.createParticle = function(config) {
	var angle = config.angle;
    var randomizeAngle = config.randomizeAngle;
    var speed = config.speed;
    angle = angle + Math.random()*randomizeAngle-randomizeAngle/2;
	var velocity = vectorScale(getDirectionFromAngle(angle), speed);

    config.velocity = velocity;

    this.game.receiveMessage(new Message('spawn', { type: 'particle', config: config }));
}
