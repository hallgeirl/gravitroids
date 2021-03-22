define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function ExplodeOnKillComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.particleSize = config.particlesize;
            this.particleCount = config.particlecount;
            this.explosionSize = config.size;
            this.position = [0,0]
            this.sound = config.sound;
            this.registerMessage('kill');
            this.registerMessage('move');
        }

        ExplodeOnKillComponent.prototype = new Component();

        ExplodeOnKillComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'kill' && (message.data == null || message.data.mode != 'final')) {
                for (var i = 0; i < this.particleCount; i++) {
                    this.messageDispatcher.sendMessage(new Message('create-particle', {
                        type: "ricochet-particle",
                        position: this.position,
                        angle: 0,
                        speed: 500 * (Math.random() + 0.5),
                        scale: Math.random() * this.particleSize,
                        lifetime: this.explosionSize,
                        randomizeAngle: Math.PI * 2
                    }));
                }
                if (this.sound)
                    this.messageDispatcher.sendMessage(new Message('play-sound', this.sound));
            } else if (message.subject == 'move') {
                this.position = message.data;
            }
        }

        ExplodeOnKillComponent.getName = function () { return "explodeonkill"; }

        return ExplodeOnKillComponent;
    });