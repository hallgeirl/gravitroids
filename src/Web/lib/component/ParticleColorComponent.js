define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function ParticleColorComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.level = 1;
            this.experience = 0;
            this.registerMessage('lifetime', null);
            this.initial = config.initialColor;
            this.target = config.targetColor;
            this.step = [0, 0, 0, 0];
            this.lifetime = 1;
            this.color = [0, 0, 0, 0];
        }

        ParticleColorComponent.prototype = new Component();

        ParticleColorComponent.prototype.receiveMessage = function(message) { 
            for (var i = 0; i < 4; i++)
                this.step[i] = (this.target[i] - this.initial[i]) / message.data;

            this.sendMessage(new Message("set-color", this.initial));
        }

        ParticleColorComponent.prototype.update = function (frameTime) {
            for (var i = 0; i < 4; i++)
                this.initial[i] += this.step[i]*frameTime

            this.sendMessage(new Message("set-color", this.initial));
        }

        ParticleColorComponent.getName = function () { return "particlecolor"; }

        return ParticleColorComponent;
    });