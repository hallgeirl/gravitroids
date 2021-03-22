define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function ExhaustComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.position = [0,0]
            this.velocity = [0,0]
            this.nparticles = config.pipes;
            this.rotation = 0;
            this.timer = new Date().getTime();
            this.registerMessage('accel');
            this.registerMessage('speed');
            this.registerMessage('rotate');
            this.registerMessage('move');
        }

        ExhaustComponent.prototype = new Component();

        ExhaustComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'speed') {
                this.velocity = message.data;
            } else if (message.subject == 'rotate') {
                this.rotation = message.data;
            } else if (message.subject == 'move') {
                this.position = message.data;
            } else if (message.subject == 'accel' && message.data.trigger == 'control') {
                var direction = vectorInvert(vectorNormalize(message.data.vector));
                var angle = getAngleFromDirection(direction);
                var shipDirection = getDirectionFromAngle(this.rotation);
                var exhaustPosition = vectorAdd(this.position, vectorScale(shipDirection, -20));
                if (new Date().getTime() - this.timer >= 10 / this.nparticles) {
                    for (var i = 0; i < this.nparticles; i++) {
                        this.timer = new Date().getTime();
                        var red = Math.random();
                        this.messageDispatcher.sendMessage(new Message('create-particle', {
                            type: "exhaust-particle",
                            position: exhaustPosition,
                            angle: angle,
                            speed: 200,//vectorLength(this.velocity) + 100,
                            scale: Math.random() * 0.5,
                            ownerVelocity: [0, 0],
                            lifetime: 0.5,
                            randomizeAngle: Math.PI / 4
                        }));
                    }
                }
            }
        }

        ExhaustComponent.getName = function () { return "exhaust"; }

        return ExhaustComponent;
    });