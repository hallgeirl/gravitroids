define(["hiage.js/core/Message", "hiage.js/component/Component"],
    function (Message, Component) {
        function WeaponLevelComponent(config, messageDispatcher) {
            Component.call(this, config, messageDispatcher);
            this.level = 1;
            this.experience = 0;
            this.registerMessage('score', null);
            this.updateExperienceAndLevel();
        }

        WeaponLevelComponent.prototype = new Component();
        WeaponLevelComponent.prototype.receiveMessage = function (message) {
            if (message.subject == 'score') {
                this.experience += message.data;
                this.updateExperienceAndLevel();
            }
        }

        WeaponLevelComponent.prototype.updateExperienceAndLevel = function () {
            if (this.experience >= this.targetExperience) {
                this.experience -= this.targetExperience;
                this.level++;
                this.sendMessage(new Message('set-weapon-level', this.level));
            }
            this.targetExperience = 1000 * Math.pow(2, this.level - 1);
            this.sendMessage(new Message('experience', { currentXP: this.experience, targetXP: this.targetExperience }));
        }

        WeaponLevelComponent.getName = function () { return "weaponlevel"; }

        return WeaponLevelComponent;
    });