function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

function getAngleFromDirection(direction) {
	var angle = Math.acos(direction.x);
	if (Math.sin(direction.y) > 0)
		angle = 2*Math.PI - angle;
	
	return angle;
}

function getDirectionFromAngle(angle) {
	return {x: Math.cos(angle), y: -Math.sin(angle)};
}

function vectorAdd(vector1, vector2) {
    return { x: vector1.x+vector2.x, y: vector1.y+vector2.y };
}

function vectorLength(vector) {
	return Math.sqrt(vector.x*vector.x+vector.y*vector.y);
}

function vectorDot(vector1, vector2) {
	return vector1.x*vector2.x+vector1.y*vector2.y;
}

function vectorNormalize(vector) {
	var length = vectorLength(vector);
	return {x: vector.x/length, y: vector.y/length};
}

function vectorInvert(vector) {
	return {x:-vector.x, y:-vector.y};
}

function vectorScale(vector, scalar) {
	return {x:vector.x*scalar, y:vector.y*scalar};
}

function vectorDifference(vector1, vector2) {
	return {x:vector1.x-vector2.x, y:vector1.y-vector2.y};
}
