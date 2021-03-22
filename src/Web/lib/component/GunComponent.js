define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function GunComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.position = [0,0]
            this.rotation = 0;
            this.fire = false;
            this.cooldownTimer = 0;
            this.sound = config.sound;
            this.registerMessage('move');
            this.registerMessage('rotate');
            this.registerMessage('control');
            this.registerMessage('set-weapon-level');
            this.levels = config.levels;
            this.setWeaponLevel(0);
        }

        GunComponent.prototype = new Component();
        GunComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'move') {
                this.position = message.data;
            } else if (message.subject == 'rotate') {
                this.rotation = message.data;
            } else if (message.subject == 'control' && (message.data.button == 'ctrl' || message.data.button == 'mouseleft')) {
                this.fire = true;
            } else if (message.subject == 'set-weapon-level') {
                this.setWeaponLevel(message.data - 1);
            }
        }

        GunComponent.prototype.setWeaponLevel = function (level) {
            if (level >= this.levels.length)
                level = this.levels.length - 1;

            this.cooldown = this.levels[level].cooldown;
            this.spread = this.levels[level].spread;
            this.barrels = this.levels[level].barrels;
        }

        GunComponent.prototype.update = function (frameTime) {
            this.cooldownTimer -= frameTime;

            if (this.fire && this.cooldownTimer <= 0) {
                for (var i = 0; i < this.barrels; i++) {
                    var finalAngle = this.rotation + this.spread * Math.random() - this.spread / 2;
                    this.messageDispatcher.sendMessage(new Message('spawn', { type: 'bullet', config: { position: this.position, velocity: vectorScale(getDirectionFromAngle(finalAngle), 800), initial: finalAngle } }, this));
                }
                if (this.sound)
                    this.messageDispatcher.sendMessage(new Message('play-sound', this.sound));
                this.cooldownTimer = this.cooldown;
            }

            this.fire = false;
        }

        GunComponent.getName = function () { return "gun"; }

        return GunComponent;
    });