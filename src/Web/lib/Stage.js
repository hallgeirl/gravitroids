define(["hiage.js/CollisionManager",
        "hiage.js/core/Message"],
    function (CollisionManager, Message) {

        function Stage(objectFactory, stageWidth, stageHeight, messageDispatcher) {
            this.collisionManager = new CollisionManager(messageDispatcher);

            this.messageDispatcher = messageDispatcher;
            this.messageDispatcher.registerHandler('kill', this, null);
            this.messageDispatcher.registerHandler('spawn', this, null);
            this.messageDispatcher.registerHandler('create-particle', this, null);
            this.messageDispatcher.registerHandler('score', this, null);
            this.messageDispatcher.registerHandler('experience', this, null);

            this.objectFactory = objectFactory;

            this.stageWidth = stageWidth;
            this.stageHeight = stageHeight;

            //Temporary workaround to allow components to get a hold of the stage dimensions
            Stage.stageWidth = stageWidth;
            Stage.stageHeight = stageHeight;
        }

        Stage.prototype.initialize = function () {
            this.score = 0;
            this.experience = 0;
            this.gameTime = 0;
            this.objects = [];
            this.easiness = 5;
            this.difficultyTimer = 10;
            this.spawnCounter = this.easiness;
            this.starSpawnCounter = 2;
            this.texts = [];
            this.scoreText = {
                x: 20,
                y: 0,
                text: 'Score: 0',
                fontSize: 30,
                fontFamily: 'Calibri',
                fill: [1,1,1,1]
            };
            this.experienceText = {
                x: 20,
                y: 50,
                text: 'XP: 0/2000',
                fontSize: 30,
                fontFamily: 'Calibri',
                fill: [1, 1, 1, 1]
            };
            this.texts.push(this.scoreText);
            this.texts.push(this.experienceText);
            this.spawnObject('ship', { position: [this.stageWidth / 2, this.stageHeight * 0.2] });

            for (var i = 0; i < 100; i++) {
                this.spawnObject("star", {
                    position: [Math.random() * this.stageWidth, Math.random() * this.stageHeight],
                    velocity: [0, -100 * Math.random()-50]
                });
            }
        }

        Stage.prototype.destroy = function () {
            for (var i = 0; i < this.objects.length; i++) {
                this.messageDispatcher.sendMessage(new Message('kill', { mode: 'final' }, this), this.objects[i].id);
            }
        }

        Stage.prototype.restart = function () {
            this.destroy();
            this.initialize();
        }

        Stage.prototype.update = function (frametime) {
            for (var i = this.objects.length - 1; i >= 0; i--) {
                this.objects[i].update(frametime);
            }

            this.collisionManager.checkCollisions();

            for (var i = this.objects.length - 1; i >= 0; i--) {
                if (!this.objects[i].alive) {
                    this.objects[i].cleanup();
                    this.objects.splice(i, 1);
                }
            }

            this.spawnCounter -= frametime;
            if (this.spawnCounter <= 0) {
                this.spawnCounter = this.easiness;
                var size = Math.floor(Math.random() * 3)
                var asteroids = ["asteroid_small", "asteroid_medium", "asteroid_large"];
                this.spawnObject(asteroids[size], {
                    position: [ Math.random() * this.stageWidth, this.stageHeight+100 ],
                    velocity: [ Math.random() * 100 - 50, -200 ]
                });
            }

            this.starSpawnCounter--;
            if (this.starSpawnCounter <= 0) {
                this.spawnObject("star", {
                    position: [Math.random() * this.stageWidth, this.stageHeight],
                    velocity: [0, -100 * Math.random()-50]
                });
                this.starSpawnCounter = 3;
            }

            this.gameTime += frametime;
            this.difficultyTimer -= frametime;
            if (this.difficultyTimer <= 0) {
                this.easiness *= 0.9;
                this.difficultyTimer = 10;
            }

            for (var i = 0; i < this.texts.length; i++) {
                this.messageDispatcher.sendMessage(new Message("rendertext", this.texts[i]));
            }
        }

        Stage.prototype.receiveMessage = function (message, sender) {
            switch (message.subject) {
                case 'create-particle':
                    this.objectFactory.createParticle(message.data);
                    break;
                case 'spawn':
                    this.spawnObject(message.data.type, message.data.config);
                    break;
                case 'score':
                    this.score += message.data;
                    this.scoreText.text = 'Score: ' + this.score;
                    break;
                case 'kill':
                    if (message.sender.owner && message.sender.owner.type == 'ship')
                        this.gameOver();
                    break;
                case 'experience':
                    this.experienceText.text = 'Next level: ' + message.data.currentXP + '/' + message.data.targetXP;
                    break;
            }
        }

        Stage.prototype.spawnObject = function (type, config) {
            var go = this.objectFactory.createObject(type, config);

            this.objects.push(go);
        }

        Stage.prototype.gameOver = function () {
            var gameOverText = {
                x: this.stageWidth / 2,
                y: this.stageHeight / 2 - 50,
                text: 'Game over!',
                fontSize: 70,
                fontFamily: 'Calibri',
                fill: [1,1,1,1],
                align: 'center'
            };
            var gameOverText2 = {
                x: this.stageWidth / 2,
                y: this.stageHeight / 2 + 50,
                text: 'Game restarts in 5 seconds.',
                fontSize: 20,
                fontFamily: 'Calibri',
                fill: [1,1,1,1],
                align: 'center'
            };
            this.texts.push(gameOverText);
            this.texts.push(gameOverText2);
            var that = this;
            setTimeout(function () { that.restart(); }, 5000);
        }
        return Stage;
    });