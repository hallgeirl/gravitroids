function ObjectFactory(game, stage, messageDispatcher) {
    this.messageDispatcher = messageDispatcher;
	this.game = game;
    this.stage = stage;
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
    this.componentMap['weaponlevel'] = WeaponLevelComponent;
    
    this.shapeMap = {}
    this.shapeMap['wedge'] = Wedge;
    this.shapeMap['regularpolygon'] = RegularPolygon;
    this.shapeMap['circle'] = Circle;
}

ObjectFactory.prototype.createObject = function(template, config) {
    var go = new GameObject(this.stage, this.messageDispatcher);
    go.type = template.type;
    config.messageTag = go.id;
    
    for (var i = 0; i < template.components.length; i++)
        go.addComponent(this.createComponent(template.components[i], config));

    go.initialize();
    
    return go;
}

ObjectFactory.prototype.createComponent = function(template, config) {
    var finalTemplate = ObjectFactory.getFinalComponentConfig(template, config);
    
    finalTemplate['shapemap'] = this.shapeMap;
    var component = new this.componentMap[template.type](finalTemplate, this.messageDispatcher);
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

ObjectFactory.prototype.createParticle = function(config) {
	var angle = config.angle;
    var randomizeAngle = config.randomizeAngle;
    var speed = config.speed;
    angle = angle + Math.random()*randomizeAngle-randomizeAngle/2;
	var velocity = vectorScale(getDirectionFromAngle(angle), speed);
    if (config.ownerVelocity)
        velocity = vectorAdd(velocity, config.ownerVelocity);
    config.velocity = velocity;

    this.stage.receiveMessage(new Message('spawn', { type: 'particle', config: config }));
}
