define([],
    function (ResourceLoaderFactory) {
        function AudioLoader() {
        }

        AudioLoader.prototype.loadResource = function (path, name) {
            var resource = { url: path };

            return resource;
        }

        AudioLoader.getName = function () { return "audio"; }

        return AudioLoader;
    });