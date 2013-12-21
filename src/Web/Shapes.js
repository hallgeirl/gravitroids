function Shape(config) {
    this.radius = 0;
    this.rotation = 0;
    this.position = { x: 0, y: 0 }
    this.fill = 'white';
    this.stroke = 'black';
    this.strokeWidth = 1;
    this.radius = 1;
    this.offset = [0,0];
    for (var prop in config) {
        if (typeof(config[prop]) == 'string' && config[prop][0] == '$')
            eval('this[prop] = ' + config[prop].substring(1));
        else
            this[prop] = config[prop];
    }
}

Shape.prototype.setRadius = function(radius) {
    this.radius = radius;
}

Shape.prototype.getRadius = function() {
    return this.radius;
}

Shape.prototype.setRotation = function(rotation) {
    this.rotation = rotation;
}

Shape.prototype.getRotation = function() {
    return this.rotation;
}

Shape.prototype.setPosition = function(x,y) {
    this.position = { x: x, y: y} ;
}

Shape.prototype.getPosition = function() {
    return this.position;
}

Shape.prototype.render = function(context) {
    context.fillStyle = this.fill;
    context.strokeStyle = this.stroke;
    context.lineWidth = this.strokeWidth;

    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation);
    context.translate(this.offset[0], this.offset[1]);

    this.renderCore(context);

    context.restore();
    context.fill();
    context.stroke();
}
Shape.prototype.renderCore = function(context) {

}

function Wedge(config) {
    Shape.call(this, config);
}

Wedge.prototype = new Shape();

Wedge.prototype.renderCore = function(context) {
    var position = this.getPosition();
    var radius = this.getRadius();

    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, 0 , this.angle, false);
    context.lineTo (0,0);
    context.closePath();
}

function RegularPolygon(config) {
    Shape.call(this, config);
}

RegularPolygon.prototype = new Shape();

RegularPolygon.prototype.renderCore = function(context) {
    var size = this.getRadius();
    var sides = this.sides;
    context.beginPath();
    for (var i = 1; i <= sides;i += 1) {
        context.lineTo (size * Math.cos(i * 2 * Math.PI / sides), size * Math.sin(i * 2 * Math.PI / sides));
    }
    context.closePath();
}

function Circle(config) {
    Shape.call(this, config);
}

Circle.prototype = new Shape();

Circle.prototype.renderCore = function(context) {
    context.beginPath();
    context.arc(0, 0, this.getRadius(), 0 , 2 * Math.PI, false);
    context.closePath();
}
