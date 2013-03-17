function Message(subject, data, sender) {
	this.subject = subject;
	this.data = data;
	this.sender = sender;
}

function Game(container, height, aspectRatio, layers) {
    this.container = container;
    this.aspectRatio = aspectRatio;
	this.frameRate = 50;
	this.intervalId = null;
	this.speedMultiplier = 10;
	this.stage = new Kinetic.Stage({
		container: container,
		width: height*aspectRatio,
		height: height
	});
	this.stageWidth = height*aspectRatio;
	this.stageHeight = height;
	this.layers = [];

	for (var i = 0; i < layers; i++) {
		this.layers.push(new Kinetic.Layer());
		this.stage.add(this.layers[i]);
	}
	

    this.scaleSceneToWindow();
    this.attachEventListeners();
    this.levelStage = new Stage(this, this.layers, this.stageWidth, this.stageHeight);
}

Game.prototype.scaleSceneToWindow = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    width = height * this.aspectRatio;
    if (width > window.innerWidth)
    {
        width = window.innerWidth;
        height = width / aspectRatio;
    }
    this.scaleScene(width, height);
}

Game.prototype.scaleScene = function(width, height) {
    this.stage.setScale(height/this.stageHeight);
    this.stage.setHeight(height);
    this.stage.setWidth(width);
	$('#' + this.container).attr('width', width);
	$('#' + this.container).attr('height', height);

    $('#' + this.container + '_size').text('#' + this.container + ' { width: ' + width + 'px; height: ' + height + 'px; }');
}

function touchMove(that, e) {
    var scale = that.stage.getScale().y;
    that.broadcast(new Message('mousemove', { x: e.targetTouches[0].pageX/scale, y: e.targetTouches[0].pageY/scale }), this);
}

Game.prototype.attachEventListeners = function() {
    var that = this;
    window.addEventListener('resize', function (e) 
    { 
        that.scaleSceneToWindow();
    });
    window.addEventListener('mousemove', function (e) {
        var scale = that.stage.getScale().y;
        that.broadcast(new Message('mousemove', { x: e.offsetX/scale, y: e.offsetY/scale }), this);
    });
    window.addEventListener('touchmove', function (e) {
        touchMove(that, e);
    });
    window.addEventListener('touchstart', function (e) {
        touchMove(that, e);
    });
    window.addEventListener('contextmenu', function (evt) { 
        if (evt.button == 2){
            evt.preventDefault();
        }
        return false;
    }, false);
}

Game.prototype.broadcast = function(message, sender) {
    this.levelStage.broadcast(message, sender);
}

Game.prototype.receiveMessage = function(message, sender) {
}


Game.prototype.update = function() {
    try {
    var frametime = 1.0/this.frameRate;
    var that = this;
	
    this.levelStage.update(frametime);
    for (var i = 0; i < this.layers.length; i++) {
        this.layers[i].draw();
    }
    requestAnimationFrame(function() { that.update() }); 
    } catch (ex) {
        this.stop();
        throw ex;
    }
}

Game.prototype.start = function() {
	var that = this;
	if (this.intervalId != null)
		return;
    requestAnimationFrame(function() { that.update() });
}

Game.prototype.stop = function() {
	if (this.intervalId == null)
		return;
	clearInterval(this.intervalId);
}
