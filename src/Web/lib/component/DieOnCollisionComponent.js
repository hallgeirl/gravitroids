define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function DieOnCollisionComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.registerMessage('collide');
        }

        DieOnCollisionComponent.prototype = new Component();

        DieOnCollisionComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'collide' && this.owner.type != message.data.other.type && this.owner.type == 'bullet') {
                this.sendMessage(new Message('kill', null, this));
            }
        }

        DieOnCollisionComponent.getName = function () { return "dieoncollision"; }

        return DieOnCollisionComponent;
    });