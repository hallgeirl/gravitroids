if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = setTimeout;
}

function Message(subject, data, sender) {
	this.subject = subject;
	this.data = data;
	this.sender = sender;
}

function Game(container, height, aspectRatio, layers) {
    this.messageDispatcher = new MessageDispatcher();
    this.audioSystem = new AudioSystem(container, 32, this.messageDispatcher);
    this.renderer = new Renderer(this.messageDispatcher, container, height, aspectRatio);
    this.container = container;
    this.aspectRatio = aspectRatio;
	this.frameRate = 50;
	this.intervalId = null;
	this.speedMultiplier = 10;
	this.stageWidth = height*aspectRatio;
	this.stageHeight = height;
	this.layers = [];

    this.scaleSceneToWindow();
    this.attachEventListeners();
    this.levelStage = new Stage(this, this.stageWidth, this.stageHeight, this.messageDispatcher);
}

Game.prototype.scaleSceneToWindow = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    width = height * this.aspectRatio;
    if (width > window.innerWidth)
    {
        width = window.innerWidth;
        height = width / this.aspectRatio;
    }
    this.scaleScene(width, height);
}

Game.prototype.scaleScene = function(width, height) {
    this.renderer.setScale(height/this.stageHeight);
    this.renderer.resizeCanvas(width, height);
	$('#' + this.container).attr('width', width);
	$('#' + this.container).attr('height', height);

    $('#' + this.container + '_size').text('#' + this.container + ' { width: ' + width + 'px; height: ' + height + 'px; }');
}

function touchMove(that, e) {
    var scale = that.renderer.getScale();
    that.messageDispatcher.sendMessage(new Message('mousemove', { x: e.targetTouches[0].pageX/scale, y: e.targetTouches[0].pageY/scale }, that));
}

Game.prototype.attachEventListeners = function() {
    var that = this;
    window.addEventListener('resize', function (e) 
    { 
        that.scaleSceneToWindow();
    });
    window.addEventListener('mousemove', function (e) {
        var scale = that.renderer.getScale();
        var offsetX = e.offsetX==undefined?e.layerX:e.offsetX;
        var offsetY = e.offsetY==undefined?e.layerY:e.offsetY;
        that.messageDispatcher.sendMessage(new Message('mousemove', { x: offsetX/scale, y: offsetY/scale }, that));
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

Game.prototype.receiveMessage = function(message, sender) {
}


Game.prototype.update = function() {
    try {
        var frametime = 1.0/this.frameRate;
        if (this.timer) {
            frametime = (new Date().getTime() - this.timer) / 1000;
            this.timer = new Date().getTime();
        } else {
            this.timer = new Date();
        }

        this.renderer.clear();
        var that = this;

        this.levelStage.update(frametime);

        this.renderer.render();

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
