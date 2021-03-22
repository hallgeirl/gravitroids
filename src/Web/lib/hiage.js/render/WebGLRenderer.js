define([],
    function () {
        function WebGLRenderer(messageDispatcher, resourceManager, container, height, aspectRatio) {
            this.resourceManager = resourceManager;

            this.messageDispatcher = messageDispatcher;
            this.messageDispatcher.registerHandler('scene-resized', this);
            this.messageDispatcher.registerHandler('render', this);
            this.messageDispatcher.registerHandler('rendertext', this);
            this.messageDispatcher.registerHandler('render-sprite', this);

            this.$container = $("#" + container);
            var width = height * aspectRatio;
            this.createCanvas(width, height);
            this.createTextureCanvas();
            this.zoom = 450;
            this.camera = [this.zoom, this.zoom / aspectRatio]
            this.stageHeight = height;
            this.aspectRatio = aspectRatio;

            this.mvMatrixStack = []

            this.textures = {}
            this.spriteTextureCoords = {}
            this.sprites = {}
            this.texts = []

            this.textTextures = {}
            this.textRenderSize = 48;

            this.hasLoadedTexture = {}
        }

        WebGLRenderer.prototype.createCanvas = function(width, height) {
            var container = this.$container[0];

            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            container.appendChild(canvas);

            this.canvas = canvas;
            this.context = this.initWebGL();
        }

        WebGLRenderer.prototype.createTextureCanvas = function () {
            var container = this.$container[0];

            var canvas = document.createElement('canvas');
            canvas.style.display = 'none';
            container.appendChild(canvas);

            this.textureCanvas = canvas;
        }

        WebGLRenderer.prototype.resizeCanvas = function(width, height) {
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';

            this.context.viewportWidth = this.canvas.width;
            this.context.viewportHeight = this.canvas.height;

            mat4.ortho(-this.zoom, this.zoom, -this.zoom / this.aspectRatio, this.zoom / this.aspectRatio, 0.1, 100, this.pMatrix);

            this.context.viewport(0, 0, this.context.viewportWidth, this.context.viewportHeight);
            this.context.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
        }

        WebGLRenderer.prototype.setZoom = function(zoom) {
            this.zoom = zoom;
        }

        WebGLRenderer.prototype.getZoom = function() {
            return this.zoom;
        }

        WebGLRenderer.prototype.receiveMessage = function (message, sender) {
            switch (message.subject) {
                case "scene-resized":
                    this.scaleScene(message.data.width, message.data.height);
                    break;
                case "rendertext":
                    this.addText(message.data);
                    break;
                case "render-sprite":
                    if (!this.sprites[message.data.layer])
                        this.sprites[message.data.layer] = []

                    this.sprites[message.data.layer].push(message.data);
                    break;
            }
        }

        WebGLRenderer.prototype.scaleScene = function(width, height) {
            this.resizeCanvas(width, height);
        }

        WebGLRenderer.prototype.render = function() {
            var gl = this.context;

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.identity(this.mvMatrix);

            mat4.translate(this.mvMatrix, [-this.camera[0], -this.camera[1], -50])
            var layers = []
            for (var layer in this.sprites)
                layers.push(Number(layer));
            layers.sort();

            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                for (var j = 0; j < this.sprites[layer].length; j++) {
                    this.renderSprite(this.sprites[layer][j])
                }
            }

            for (var i = 0; i < this.texts.length; i++) {
                this.renderText(this.texts[i])
            }

            this.sprites = {};

            this.texts = [];
        }

        WebGLRenderer.prototype.pushMatrix = function () {
            var copy = mat4.create();
            mat4.set(this.mvMatrix, copy);
            this.mvMatrixStack.push(copy);
        }

        WebGLRenderer.prototype.popMatrix = function () {
            this.mvMatrix = this.mvMatrixStack.pop();
        }

        WebGLRenderer.prototype.renderSprite = function (config) {
            var gl = this.context;

            this.pushMatrix();

            var frameWidth = config.sprite.defaults["frame-width"]
            var frameHeight = config.sprite.defaults["frame-height"]

            mat4.translate(this.mvMatrix, [config.position[0], config.position[1], config.layer]);
            mat4.rotate(this.mvMatrix, config.rotation - Math.PI / 2.0, [0, 0, 1]);
            mat4.scale(this.mvMatrix, [frameWidth * config.scale, frameHeight * config.scale, 1]);
            mat4.translate(this.mvMatrix, [-0.5, -0.5, 0]);
            
            if (this.bindSpriteTextureCoordBuffer(config)) {
                this.bindTextureByName(config.sprite.texture);

                this.bindVertexBuffer();
                this.drawVertexBuffer(config.color);
            }

            this.popMatrix();
        }

        WebGLRenderer.prototype.addText = function (config) {
            this.texts.push(config);
        }

        WebGLRenderer.prototype.renderText = function (config) {
            var texture = this.getTextTexture(config);

            this.pushMatrix();

            this.bindTextureCoordBuffer(texture.textureCoordBuffer);
            this.bindTexture(texture.texture);
            this.bindVertexBuffer();

            var textX = config.x;
            if (config.align == 'center')
                textX -= texture.width * (config.fontSize / this.textRenderSize) / 2;
            mat4.translate(this.mvMatrix, [textX, config.y, 0]);

            mat4.scale(this.mvMatrix, [texture.width * (config.fontSize / this.textRenderSize), texture.height * (config.fontSize / this.textRenderSize), 1])

            this.drawVertexBuffer(config.fill);

            this.popMatrix();
        }

        WebGLRenderer.prototype.setFont = function(config, context) {
            context.fillStyle = 'white';
            context.font = this.textRenderSize + 'px ' + config.fontFamily;
            context.textAlign = 'left';
            context.textBaseline = 'middle';
        }

        WebGLRenderer.prototype.getTextTexture = function (config) {
            if (!this.textTextures[config.text]) {
                var dimensions = this.renderTextToCanvas(config);

                this.textTextures[config.text] = {
                    texture: this.createTextGLTexture(),
                    textureCoordBuffer: this.createTextureCoordBuffer(0, 0, dimensions.width, dimensions.height, this.textureCanvas.width, this.textureCanvas.height),
                    width: dimensions.width,
                    height: dimensions.height
                }
            }

            return this.textTextures[config.text];
        }

        WebGLRenderer.prototype.renderTextToCanvas = function(config) {
            var context = this.textureCanvas.getContext("2d");

            this.setFont(config, context);

            var textWidth = context.measureText(config.text).width;
            var textHeight = 2 * this.textRenderSize;
            this.textureCanvas.width = getPowerOfTwo(textWidth);
            this.textureCanvas.height = getPowerOfTwo(textHeight);

            this.setFont(config, context);

            context.fillText(config.text, 0, this.textRenderSize);

            return { width: textWidth, height: textHeight }
        }

        WebGLRenderer.prototype.createTextGLTexture = function () {
            var gl = this.context;
            var texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);

            return texture;
        }

        WebGLRenderer.prototype.initWebGL = function() {
            try
            {
                var gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                this.initShaders(gl);
                this.initBuffers(gl);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);
                gl.disable(gl.DEPTH_TEST);
                this.pMatrix = mat4.create();
                this.mvMatrix = mat4.create();

                return gl;
            }
            catch (e)
            {
                throw ["Unable to initialize WebGL. Make sure you have a WebGL enabled browser.", e]
            }
        }

        WebGLRenderer.prototype.initShaders = function (gl) {
            var fragmentShader = getShader(gl, "shader-fs")
            var vertexShader = getShader(gl, "shader-vs")
            var sp = gl.createProgram();
            gl.attachShader(sp, fragmentShader);
            gl.attachShader(sp, vertexShader);
            gl.linkProgram(sp);
            gl.useProgram(sp);

            sp.vertexPositionAttribute = gl.getAttribLocation(sp, "aVertexPosition");
            gl.enableVertexAttribArray(sp.vertexPositionAttribute);

            sp.textureCoordAttribute = gl.getAttribLocation(sp, "aTextureCoord");
            gl.enableVertexAttribArray(sp.textureCoordAttribute);

            sp.pMatrixUniform = gl.getUniformLocation(sp, "uPMatrix");
            sp.mvMatrixUniform = gl.getUniformLocation(sp, "uMVMatrix");
            sp.colorUniform = gl.getUniformLocation(sp, "uColor");

            this.shaderProgram = sp;
        }

        WebGLRenderer.prototype.initBuffers = function (gl) {
            this.rectVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.rectVertexPositionBuffer);

            var vertices = [
                 1.0, 1.0, 0.0,
                 0.0, 1.0, 0.0,
                 1.0, 0.0, 0.0,
                 0.0, 0.0, 0.0
            ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            this.rectVertexPositionBuffer.itemSize = 3;
            this.rectVertexPositionBuffer.numItems = 4;
        }

        WebGLRenderer.prototype.bindTextureByName = function (name) {
            var gl = this.context;
            if (!this.textures[name]) {
                this.textures[name] = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this.textures[name]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 0]));

                var image = this.resourceManager.getResource("texture", name)
                var that = this;
                image.onload = function () {
                    that.createGLTexture(image, that.textures[name])
                    that.hasLoadedTexture[name] = true;
                };

                if (image.complete && !this.hasLoadedTexture[name])
                    this.createGLTexture(image, this.textures[name])
            }
            
            this.bindTexture(this.textures[name]);
        }

        WebGLRenderer.prototype.bindTexture = function (texture) {
            var gl = this.context;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uSampler"), 0);
        }

        WebGLRenderer.prototype.createGLTexture = function (image, texture) {
            var gl = this.context;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        WebGLRenderer.prototype.bindSpriteTextureCoordBuffer = function (config) {
            if (!this.spriteTextureCoords[config.name]) {
                var image = this.resourceManager.getResource("texture", config.sprite.texture);
                if (image.width == 0)
                    return false;

                var animations = {}
                for (var i = 0; i < config.sprite.animations.length; i++) {
                    var a = config.sprite.animations[i];
                    var animationBuffers = []
                    for (var j = 0; j < a.frames.length; j++) {
                        var f = a.frames[j]
                        animationBuffers.push(this.createTextureCoordBuffer(f.x, f.y, config.sprite.defaults["frame-width"], config.sprite.defaults["frame-height"], image.width, image.height))
                    }
                    animations[config.animation] = animationBuffers;
                }
                this.spriteTextureCoords[config.name] = animations;
            }

            this.bindTextureCoordBuffer(this.spriteTextureCoords[config.name][config.animation][config.frame]);

            return true;
        }

        WebGLRenderer.prototype.bindTextureCoordBuffer = function (buffer) {
            var gl = this.context;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
        }

        WebGLRenderer.prototype.bindVertexBuffer = function() { 
            var gl = this.context;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.rectVertexPositionBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.rectVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        WebGLRenderer.prototype.drawVertexBuffer = function (color) {
            var gl = this.context;

            gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
            gl.uniform4fv(this.shaderProgram.colorUniform, color);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.rectVertexPositionBuffer.numItems);
        }

        WebGLRenderer.prototype.createTextureCoordBuffer = function (sx, sy, frameWidth, frameHeight, imageWidth, imageHeight) {
            var gl = this.context;
            var left = sx / imageWidth;
            var top = (sy+frameHeight) / imageHeight;
            var right = (sx+frameWidth) / imageWidth;
            var bottom = sy / imageHeight;
            var data = [
                right, bottom,
                left, bottom,
                right, top,
                left, top
            ]
            
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            
            return buffer;
        }

        WebGLRenderer.prototype.screenToSceneCoordinates = function (screenCoords, screenDimensions) {
            var x = this.zoom * 2.0 * screenCoords[0] / screenDimensions[0] + this.camera[0] - this.zoom
            var y = this.zoom * 2.0 * (1-screenCoords[1] / screenDimensions[1])/this.aspectRatio + this.camera[1] - this.zoom/this.aspectRatio
            return [x,y]
        }

        function getShader(gl, id) {
            var $shaderScript = $("#" + id);
            var shaderSource = $shaderScript.text();
            var shaderType = $shaderScript.attr("type");
            var shader = null;

            if (shaderType == "x-shader/x-fragment")
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            else if (shaderType == "x-shader/x-vertex")
                shader = gl.createShader(gl.VERTEX_SHADER);
            else
                return null;

            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            return shader;
        }

        function getPowerOfTwo(value) {
            var pow = pow || 1;
            while (pow < value) {
                pow *= 2;
            }
            return pow;
        }

        return WebGLRenderer;
    })