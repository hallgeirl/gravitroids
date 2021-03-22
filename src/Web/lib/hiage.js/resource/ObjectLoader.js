define([],
    function () {
        function ObjectLoader() {
        }

        ObjectLoader.prototype.loadResource = function (path, name) {
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

        ObjectLoader.getName = function () { return "object"; }

        return ObjectLoader;
    });