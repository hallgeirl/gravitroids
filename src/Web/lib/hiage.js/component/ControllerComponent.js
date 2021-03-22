define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function ControllerComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.registerMessage('mousemove', null);

            this.pressed = {};
            this.mouse = { left: false, right: false, position: [0, 0] };
            var that = this;
            window.addEventListener('keydown', function (evt) {
                that.pressed[evt.keyCode] = true;
            });
            window.addEventListener('keyup', function (evt) {
                that.pressed[evt.keyCode] = false;
            });
            window.addEventListener('mousedown', function (evt) {
                if (evt.button == 0)
                    that.mouse.left = true;
                else if (evt.button == 2)
                    that.mouse.right = true;
            });
            window.addEventListener('mouseup', function (evt) {
                if (evt.button == 0)
                    that.mouse.left = false;
                else if (evt.button == 2)
                    that.mouse.right = false;
            });
            window.addEventListener('touchstart', function (evt) {
                that.mouse.left = true;
            });
            window.addEventListener('touchend', function (evt) {
                that.mouse.left = false;
            });
        }

        ControllerComponent.prototype = new Component();
        ControllerComponent.prototype.update = function (frameTime) {
            if (this.mouse.left) {
                this.sendMessage(new Message('control', { button: 'mouseleft', position: this.mouse.position }));
            }
            if (this.mouse.right) {
                this.sendMessage(new Message('control', { button: 'mouseright', position: this.mouse.position }));
            }
            if (this.pressed[38]) {
                this.sendMessage(new Message('control', { button: 'up' }, this));
            }
            if (this.pressed[40]) {
                this.sendMessage(new Message('control', { button: 'down' }, this));
            }
            if (this.pressed[37]) {
                this.sendMessage(new Message('control', { button: 'left' }, this));
            }
            if (this.pressed[39]) {
                this.sendMessage(new Message('control', { button: 'right' }, this));
            }
            if (this.pressed[17]) {
                this.sendMessage(new Message('control', { button: 'ctrl' }, this));
            }
        }
        ControllerComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'mousemove') {
                this.mouse.position = message.data;
            }
        }

        ControllerComponent.prototype.getHandledMessages = function () {
            return ['mousemove'];
        }

        ControllerComponent.getName = function () { return "controller"; }

        return ControllerComponent;
    });