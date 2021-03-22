define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function LifetimeComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.lifetime = config.lifetime;
        }

        LifetimeComponent.prototype = new Component();

        LifetimeComponent.prototype.initialize = function () {
            this.sendMessage(new Message("lifetime", this.lifetime));
        }

        LifetimeComponent.prototype.update = function (frameTime) {
            this.lifetime -= frameTime;
            
            if (this.lifetime <= 0) {
                this.sendMessage(new Message('kill', null, this));
            }
        }

        LifetimeComponent.getName = function () { return "lifetime"; }

        return LifetimeComponent;
    });