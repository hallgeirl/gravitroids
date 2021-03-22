define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function ContinuousRotationComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.direction = config.direction;
            if (!this.direction)
                this.direction = 1;
        }

        ContinuousRotationComponent.prototype = new Component();
        ContinuousRotationComponent.prototype.update = function (frameTime) {
            if (this.direction > 0)
                this.sendMessage(new Message('rotate-right', { button: 'right' }, this));
            else
                this.sendMessage(new Message('rotate-left', { button: 'left' }, this));
        }

        ContinuousRotationComponent.getName = function () { return "continuousrotation"; }

        return ContinuousRotationComponent;
    });