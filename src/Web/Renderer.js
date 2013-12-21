function Renderer(messageDispatcher, container, height, aspectRatio) {
    this.messageDispatcher = messageDispatcher;
    this.messageDispatcher.registerHandler('render', this);
    this.container = container;   
    var width = height * aspectRatio;
    this.createCanvas(width, height);
    this.shapes = [];
    this.scale = 1;
}

Renderer.prototype.createCanvas = function(width, height) {
    var container = $('#' + this.container)[0];

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    this.canvas = canvas;
    this.context = canvas.getContext('2d');
}

Renderer.prototype.resizeCanvas = function(width, height) {
   this.canvas.style.width = width + 'px';
   this.canvas.style.height = height + 'px';
}

Renderer.prototype.setScale = function(scale) {
    this.scale = scale;
}

Renderer.prototype.getScale = function(scale) {
    return this.scale;
}

Renderer.prototype.receiveMessage = function(message, sender) {
    this.renderShape(message.data);
}

Renderer.prototype.render = function() {
    var context = this.context;
    for (var i = 0; i < this.shapes.length; i++) {
        var shape = this.shapes[i];
        shape.render(context);
    }
}

Renderer.prototype.renderShape = function(shape) {
    shape.position.x = Math.round(shape.position.x);
    shape.position.y = Math.round(shape.position.y);
    this.shapes.push(shape);
}

Renderer.prototype.renderText = function(config) {
    var context = this.context;
    context.fillStyle = config.fill;
    context.font = config.fontSize + 'px ' + config.fontFamily;  
    context.textAlign = config.align ? config.align : 'left';
    context.textBaseline = 'middle';
    context.fillText(config.text, config.x, config.y);
}

Renderer.prototype.clear = function() {
    this.shapes = [];
    // Store the current transformation matrix
    this.context.save();

    // Use the identity matrix while clearing the canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Restore the transform
    this.context.restore();
}
