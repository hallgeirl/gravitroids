define(["hiage.js/audio/AudioSystem",
        "hiage.js/core/MessageDispatcher",
        "hiage.js/render/WebGLRenderer",
        "hiage.js/core/Message",
        "hiage.js/resource/ResourceManager",
        "hiage.js/core/ObjectFactory",
        "hiage.js/component/ComponentFactory"],

    function (AudioSystem, MessageDispatcher, Renderer, Message, ResourceManager, ObjectFactory, ComponentFactory) {
        function Game(container, height, aspectRatio, layers, resourceFile) {
            this.messageDispatcher = new MessageDispatcher();
            this.resourceManager = new ResourceManager();
            this.resourceManager.loadResources(resourceFile);
            this.renderer = new Renderer(this.messageDispatcher, this.resourceManager, container, height, aspectRatio);
            this.audioSystem = new AudioSystem(this.resourceManager, 32, this.messageDispatcher);
            this.$container = $("#" + container);
            this.aspectRatio = aspectRatio;
            this.frameRate = 50;
            this.intervalId = null;
            this.scaleSceneToWindow();
            this.attachEventListeners();
            this.objectFactory = new ObjectFactory(this.resourceManager, this.messageDispatcher);
            this.gamestates = []
            
        }

        //Game state management
        Game.prototype.pushState = function (gamestate) {
            if (this.gamestates.length > 0)
                this.gamestates[this.gamestates.length - 1].suspend();

            this.gamestates.push(gamestate);
        }

        Game.prototype.popState = function (gamestate) {
            if (this.gamestates.length == 0)
                throw "Could not pop state: No states to pop."

            this.gamestates.pop();
            if (this.gamestates.length > 0)
                this.gamestates[this.gamestates.length - 1].resume();
        }

        Game.prototype.scaleSceneToWindow = function () {
            var width = window.innerWidth;
            var height = window.innerHeight;

            width = height * this.aspectRatio;
            if (width > window.innerWidth) {
                width = window.innerWidth;
                height = width / this.aspectRatio;
            }
            
            this.messageDispatcher.sendMessage(new Message("scene-resized", { width: width, height: height }));
        }

        function touchMove(that, e) {
            //var scale = that.renderer.getScale();
            var scale = 1;
            that.messageDispatcher.sendMessage(new Message('mousemove', [ e.targetTouches[0].pageX / scale, e.targetTouches[0].pageY / scale ], that));
        }

        Game.prototype.attachEventListeners = function () {
            var that = this;
            window.addEventListener('resize', function (e) {
                that.scaleSceneToWindow();
            });
            window.addEventListener('mousemove', function (e) {
                var offsetX = e.offsetX == undefined ? e.layerX : e.offsetX;
                var offsetY = e.offsetY == undefined ? e.layerY : e.offsetY;
                var offs = that.renderer.screenToSceneCoordinates([offsetX, offsetY], [that.$container.height()*that.aspectRatio, that.$container.height()])
                that.messageDispatcher.sendMessage(new Message('mousemove', [offs[0], offs[1]], that));
            });
            this.$container.on('touchmove', function (e) {
                touchMove(that, e);
            });
            this.$container.on('touchstart', function (e) {
                touchMove(that, e);
            });
            this.$container.on('contextmenu', function (evt) {
                if (evt.button == 2) {
                    evt.preventDefault();
                }
                return false;
            }, false);
        }

        Game.prototype.receiveMessage = function (message, sender) {
        }


        Game.prototype.update = function () {
            try {
                var frametime = 1.0 / this.frameRate;
                if (this.timer) {
                    frametime = (new Date().getTime() - this.timer) / 1000;
                    this.timer = new Date().getTime();
                } else {
                    this.timer = new Date();
                }

                var that = this;

                if (this.gamestates.length > 0)
                    this.gamestates[this.gamestates.length - 1].update(frametime);

                this.renderer.render();

                requestAnimationFrame(function () { that.update() });
            } catch (ex) {
                this.stop();
                throw ex;
            }
        }

        Game.prototype.start = function () {
            var that = this;
            if (this.intervalId != null)
                return;
            requestAnimationFrame(function () { that.update() });
        }

        Game.prototype.stop = function () {
            if (this.intervalId == null)
                return;
            clearInterval(this.intervalId);
        }

        return Game
    }
)