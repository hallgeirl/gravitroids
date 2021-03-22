define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function CollisionComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.registerMessage('move');
            this.registerMessage('kill');
            this.collisionBox = {
                position: [0, 0],
                radius: config.radius
            }
        }

        CollisionComponent.prototype = new Component();

        CollisionComponent.prototype.initialize = function () {
            this.messageDispatcher.sendMessage(new Message('register-collision-target', { collisionBox: this.collisionBox, object: this.owner }));
        }

        CollisionComponent.prototype.receiveMessage = function (message) {
            if (message.subject == "move") {
                this.collisionBox.position = [message.data[0], message.data[1]];
            }
            if (message.subject == 'kill') {
                this.messageDispatcher.sendMessage(new Message('unregister-collision-target', this.owner));
            }
        }

        CollisionComponent.getName = function () { return "collision"; }

        return CollisionComponent;
    });