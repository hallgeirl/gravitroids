define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function SpatialComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.position = [config.position[0], config.position[1]];
            this.velocity = [0, 0];
            if (config.velocity)
                this.velocity = [config.velocity[0], config.velocity[1]];
            this.registerMessage("accel", this.messageTag);
        }

        SpatialComponent.prototype = new Component();
        SpatialComponent.prototype.update = function (frameTime) {
            this.position[0] += this.velocity[0] * frameTime;
            this.position[1] += this.velocity[1] * frameTime;

            this.sendMessage(new Message('move', [ this.position[0], this.position[1] ], this));
            this.sendMessage(new Message('speed', [ this.velocity[0], this.velocity[1] ], this));
        }

        SpatialComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'accel') {
                
                this.velocity[0] += message.data.vector[0];
                this.velocity[1] += message.data.vector[1];
            }
        }

        SpatialComponent.getName = function () { return "spatial"; }

        return SpatialComponent;
    });