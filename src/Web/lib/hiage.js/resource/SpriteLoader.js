define([],
    function () {
        function SpriteLoader() {
        }

        SpriteLoader.prototype.loadResource = function (path, name) {
            var resource = null;
            $.ajax({
                dataType: "json",
                async: false,
                url: path,
                success: function (data) {
                    resource = data;
                },
                error: function (data) {
                    console.log(data);
                    throw "Unable to load resource from path " + path + " with name " + name;
                }
            });

            return resource;
        }

        SpriteLoader.getName = function () { return "sprite"; }

        return SpriteLoader;
    });