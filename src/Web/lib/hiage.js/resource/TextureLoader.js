define([],
    function () {
        function TextureLoader() {
        }

        TextureLoader.prototype.loadResource = function (path, name) {
            var resource = new Image();
            resource.src = path;

            return resource;
        }

        TextureLoader.getName = function () { return "texture"; }

        return TextureLoader;
    });