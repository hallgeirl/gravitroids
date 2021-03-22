define(["hiage.js/resource/Resource", "hiage.js/resource/ResourceLoaderFactory"],
    function (Resource, ResourceLoaderFactory) {
        function ResourceManager() {
            this.resources = {}
        }

        ResourceManager.prototype.loadResources = function (path) {
            console.log("Loading resources from " + path)

            var that = this;
            $.ajax({
                url: path,
                async: false,
                dataType: "json",
                success: function (data) {
                    var currentPath = path.substring(0, path.lastIndexOf("/"))
                    that.parseResources(data, currentPath);
                },
                error: function (data) {
                    throw "Unable to load resources from " + path
                }
            });
        }

        ResourceManager.prototype.parseResources = function (resources, path) {
            for (var i = 0; i < resources.length; i++) {
                var res = resources[i];
                if (res.type == "resources")
                    this.loadResources(path + "/" + res.path);
                else
                    this.loadResource(res.type, path + "/" + res.path, res.name);
            }
        }

        ResourceManager.prototype.loadResource = function (type, path, name) {
            if (!this.resources[type])
                this.resources[type] = {};

            this.resources[type][name] = new Resource(type, path, name);
            var loader = ResourceLoaderFactory.getResourceLoader(type);
            this.resources[type][name].load(loader);
        }

        ResourceManager.prototype.getResource = function (type, name) {
            if (!this.resources[type] || !this.resources[type][name])
                throw "Resource " + name + " of type " + type + " does not exist."

            var res = this.resources[type][name];
            if (!res.isLoaded()) {
                console.log("Loading " + type + " resource \"" + name + "\"...");
                var loader = ResourceLoaderFactory.getResourceLoader(type);
                res.load(loader);
            }

            return this.resources[type][name].getResource();
        }

        return ResourceManager;
    });