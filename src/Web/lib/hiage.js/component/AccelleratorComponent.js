define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function AccelleratorComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.accel = [0,0]
            this.magnitude = config.magnitude;

            this.registerMessage('control');
        }

        AccelleratorComponent.prototype = new Component();
        AccelleratorComponent.prototype.update = function (frameTime) {
            if (this.accel[0] == 0 && this.accel[1] == 0)
                return;

            this.sendMessage(new Message('accel', { vector: [this.accel[0] * frameTime, this.accel[1] * frameTime], trigger: 'control' }));
            
            this.accel[0] = this.accel[1] = 0;
        }

        AccelleratorComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'control') {
                switch (message.data.button) {
                    case 'up':
                        this.accel[1] = this.magnitude;
                        break;
                    case 'down':
                        this.accel[1] = -this.magnitude;
                        break;
                    case 'left':
                        this.accel[0] = -this.magnitude;
                        break;
                    case 'right':
                        this.accel[0] = this.magnitude;
                        break;
                }
            }
        }

        AccelleratorComponent.getName = function () { return "accellerator"; }

        return AccelleratorComponent;
    });