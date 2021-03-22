function clone(obj, recursed) {
    //Check for value type
    if (typeof (obj) != "object")
        return obj;

    if (obj instanceof Array) {
        return cloneArray(obj);
    }
    
    var newObj = {};
    for (var prop in obj) {
        if (typeof (obj[prop]) == "object")
            newObj[prop] = clone(obj[prop], true);
        else
            newObj[prop] = obj[prop];
    }
    return newObj;
}

function cloneArray(obj) {
    var result = []
    for (var i = 0; i < obj.length; i++) {
        result.push(clone(obj[i]));
    }

    return result;
}

function getAngleFromDirection(direction) {
	var angle = Math.acos(direction[0]);
	if (Math.sin(direction[1]) > 0)
		angle = 2*Math.PI - angle;
	
	return angle;
}

function getDirectionFromAngle(angle) {
	return [Math.cos(angle), -Math.sin(angle)];
}

function vectorAdd(vector1, vector2) {
    return [vector1[0]+vector2[0], vector1[1]+vector2[1]];
}

function vectorLength(vector) {
	return Math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]);
}

function vectorDot(vector1, vector2) {
	return vector1[0]*vector2[0]+vector1[1]*vector2[1];
}

function vectorNormalize(vector) {
	var length = vectorLength(vector);
	return [vector[0]/length, vector[1]/length];
}

function vectorInvert(vector) {
    return [-vector[0], -vector[1]];
}

function vectorScale(vector, scalar) {
	return [vector[0]*scalar, vector[1]*scalar];
}

function vectorDifference(vector1, vector2) {
    return [vector1[0] - vector2[0], vector1[1] - vector2[1]];
}
