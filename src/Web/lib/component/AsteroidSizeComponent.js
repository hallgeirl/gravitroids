define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function AsteroidSizeComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.position = [0,0]
            this.size = config.size;
            this.health = this.size * 400;
            this.registerMessage('kill');
            this.registerMessage('move');
            this.registerMessage('collide');
        }

        AsteroidSizeComponent.prototype = new Component();
        AsteroidSizeComponent.prototype.initialize = function () {
        }

        AsteroidSizeComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'kill') {
                if ((message.data == null || message.data.mode != 'final') && this.size > 1) {
                    for (var i = 0; i < 2; i++) {
                        var velocity = getDirectionFromAngle(Math.random() * 2 * Math.PI);
                        velocity = vectorScale(velocity, 200);

                        var size = this.size - 1 - 1;
                        var asteroids = ["asteroid_small", "asteroid_medium", "asteroid_large"];
                        this.messageDispatcher.sendMessage(new Message('spawn', { type: asteroids[size], config: { position: this.position, velocity: velocity } }, this));
                    }
                }
            } else if (message.subject == 'move') {
                this.position = message.data;
            } else if (message.subject == 'collide') {
                if (message.data.other.type == 'bullet')
                    this.health -= 100;
            }
        }

        AsteroidSizeComponent.prototype.update = function (frameTime) {
            if (this.health <= 0) {
                this.sendMessage(new Message('kill', null, this));
            }
        }

        AsteroidSizeComponent.getName = function () { return "asteroidsize"; }

        return AsteroidSizeComponent;
    });