var ship = 
{ 
    type: 'ship', 
    components: [
        {
            type: 'shape',
            shape: 
            {
                type: 'wedge',
                sides: 3, radius: 30,
                fill: 'red',
                stroke: 'black',
                strokeWidth: 2,
                angle: Math.PI/4,
                offset: [-15,-7]
            },
            rotation: 3.55
        },
        {
            type: 'spatial',
            velocity: 
            {
                x: 0, y: 0
            },
            position:
            {
                x: 0, y: 0
            }
        },
        {
            type: 'controller'
        },
        {
            type: 'accellerator',
            magnitude: 200
        },
        {
            type: 'gravity',
            magnitude: -98.8
        },
        {
            type: 'exhaust',
            pipes: 3
        },
        {
            type: 'rotation',
            initial: Math.PI/2.0,
            speed: 0.05
        },
        {
            type: 'gun',
            levels: [
                {
                    cooldown: 0.1,
                    spread: 0.1,
                    barrels: 1
                },
                {
                    cooldown: 0.075,
                    spread: 0.1,
                    barrels: 1
                },
                {
                    cooldown: 0.05,
                    spread: 0.05,
                    barrels: 1
                },
                {
                    cooldown: 0.1,
                    spread: 0.15,
                    barrels: 2
                },
                {
                    cooldown: 0.075,
                    spread: 0.15,
                    barrels: 2
                },
                {
                    cooldown: 0.05,
                    spread: 0.15,
                    barrels: 2
                }
            ],
            sound: 'sound/gun.ogg'
        },
        {
            type: 'collision'
        },
        {
            type: 'explodeonkill',
            particlesize: 20,
            particlecount: 100,
            size: 5,
            sound: 'sound/explode3.ogg'
        },
        {
            type: 'dieonasteroidcollision'
        },
        {
            type: 'destroyoutofbounds'
        },
        {
            type: 'weaponlevel'
        }
    ]
}

var bullet = 
{
    type: 'bullet', 
    components: [
        {
            type: 'shape',
            shape: 
            {
                type: 'regularpolygon',
                sides: 3, radius: 4,
                fill: 'black',
                stroke: 'none',
                strokeWidth: 0
            },
            rotation: 0
        },
        {
            type: 'spatial',
            velocity: { x: 0, y: 0 },
            position: { x: 0, y: 0 }
        },
        {
            type: 'rotation',
            initial: 0,
            speed: 0
        },
        {
            type: 'collision'
        },
        {
            type: 'explodeonkill',
            particlesize: 5,
            particlecount: 5,
            size: 1,
            sound: 'sound/explode2.ogg'
        },
        {
            type: 'dieonasteroidcollision'
        },
        {
            type: 'destroyoutofbounds'
        }
    ]
};

var asteroid = 
{
    type: 'asteroid', 
    components: [
        {
            type: 'shape',
            shape: 
            {
                type: 'regularpolygon',
                sides: '$Math.floor((Math.random()*10)+5)', radius: 25,
                fill: 'gray',
                stroke: 'black',
                strokeWidth: 2,
            } 
        },
        {
            type: 'spatial',
            velocity: { x: 0, y: 0 },
            position: { x: 0, y: 0 }
        },
        {
            type: 'gravity',
            magnitude: -98.8
        },
        {
            type: 'rotation',
            initial: Math.PI/2.0,
            speed: '$Math.random()*0.05'
        },
        {
            type: 'asteroidsize',
            size: 1
        },
        {
            type: 'continuousrotation',
            direction: '$Math.random()-0.5'
        },
        {
            type: 'collision'
        },
        {
            type: 'explodeonkill',
            particlesize: 5,
            particlecount: 5,
            size: 0.5,
            sound: 'sound/explode.ogg'
        },
        {
            type: 'destroyoutofbounds'
        },
        {
            type: 'points',
            points: 100
        }
    ]
};

var particle = 
{
    type: 'particle', 
    components: [
        {
            type: 'shape',
            shape: 
            {
                type: 'circle',
                radius: 5,
                fill: 'red',
                stroke: 'black',
                strokeWidth: 2,
            } 
        },
        {
            type: 'spatial',
            velocity: { x: 0, y: 0 },
            position: { x: 0, y: 0 }
        },
        {
            type: 'lifetime',
            lifetime: 1
        },
        { 
            type: 'size',
            size: 5
        }
    ]
};
