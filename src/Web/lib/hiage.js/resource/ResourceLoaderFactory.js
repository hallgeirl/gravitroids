define([],
    function () {
        function ResourceLoaderFactory() {
        }

        ResourceLoaderFactory.getResourceLoader = function (resourceType) {
            if (!ResourceLoaderFactory.loaders[resourceType])
                throw "Resource loader for resource type " + resourceType + " is not registered."

            return new ResourceLoaderFactory.loaders[resourceType];
        }

        ResourceLoaderFactory.registerResourceLoader = function (resourceType, loader) {
            if (!loader.prototype["loadResource"])
                throw "Invalid resource loader for resource type " + resourceType + ": Does not contain a loadResource function.";
            console.log("Registered resource loader for " + resourceType);
            ResourceLoaderFactory.loaders[resourceType] = loader;
        }

        ResourceLoaderFactory.loaders = {};

        return ResourceLoaderFactory;
    });