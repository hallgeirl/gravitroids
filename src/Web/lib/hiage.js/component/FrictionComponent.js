define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function FrictionComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.magnitude = config.friction;
            this.velocity = [ 0, 0 ];
            this.registerMessage('speed');
        }

        FrictionComponent.prototype = new Component();
        FrictionComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'speed') {
                this.velocity[0] = message.data[0];
                this.velocity[1] = message.data[1];
            }
        }

        FrictionComponent.prototype.update = function (frameTime) {
            var x, y;

            if (this.velocity[0] == 0 && this.velocity[1] == 0)
                return;

            var direction = vectorInvert(vectorNormalize(this.velocity));
            if (this.velocity[0] > 0)
                x = Math.max(direction[0] * this.magnitude * frameTime, -this.velocity[0]);
            else
                x = Math.min(direction[0] * this.magnitude * frameTime, -this.velocity[0]);

            if (this.velocity[1] > 0)
                y = Math.max(direction[1] * this.magnitude * frameTime, -this.velocity[1]);
            else
                y = Math.min(direction[1] * this.magnitude * frameTime, -this.velocity[1]);

            this.sendMessage(new Message('accel', { vector: [x, y] }, this));
        }

        FrictionComponent.getName = function () { return "friction"; }

        return FrictionComponent;
    });