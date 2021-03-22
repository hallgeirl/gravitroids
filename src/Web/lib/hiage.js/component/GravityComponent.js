define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function GravityComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.gravity = config.magnitude;
        }

        GravityComponent.prototype = new Component();
        GravityComponent.prototype.update = function (frameTime) {
            this.sendMessage(new Message('accel', { vector: [0, -this.gravity * frameTime] } ));
        }

        GravityComponent.getName = function () { return "gravity"; }

        return GravityComponent;
    });