define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function RotationComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.angle = config.initial;
            this.angleDiff = 0;
            this.rotationSpeed = config.speed;
            this.position = [0, 0];
            this.registerMessage('control');
            this.registerMessage('move');
            this.registerMessage('rotate-left');
            this.registerMessage('rotate-right');
        }

        RotationComponent.prototype = new Component();
        RotationComponent.prototype.initialize = function () {
            this.sendMessage(new Message('rotate', this.angle, this));
        }

        RotationComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'control') {
                switch (message.data.button) {
                    case 'mouseright':
                    case 'mouseleft':
                        var diff = vectorDifference(message.data.position, this.position);
                        var direction = vectorNormalize(diff)
                        
                        var angle = getAngleFromDirection(direction);
                        this.angleDiff = angle - this.angle;
                        break;
                }
            } else if (message.subject == 'move') {
                this.position = message.data;
            }
            else if (message.subject = 'rotate-left') {
                this.angleDiff = this.rotationSpeed;
            } else if (message.subject = 'rotate-right') {
                this.angleDiff = -this.rotationSpeed;
            }
        }

        RotationComponent.prototype.update = function (frameTime) {
            if (this.angleDiff == 0)
                return;

            this.angle += this.angleDiff;

            while (this.angle < 0)
                this.angle += 2 * Math.PI;

            while (this.angle > 2 * Math.PI)
                this.angle -= 2 * Math.PI;

            this.angleDiff = 0;
            this.sendMessage(new Message('rotate', this.angle, this));
        }

        RotationComponent.getName = function () { return "rotation"; }

        return RotationComponent;
    });