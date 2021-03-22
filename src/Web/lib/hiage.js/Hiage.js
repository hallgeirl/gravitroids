//var jqueryScript = document.createElement("script");
//jqueryScript.setAttribute("src", "lib/jquery-2.1.0.min.js")
//document.head.appendChild(jqueryScript)

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = setTimeout;
}

requirejs.config({
    baseUrl: "lib",
    paths: {
        'jquery': "jquery-2.1.0.min"
    }
})

var glMatrix = document.createElement("script")
glMatrix.setAttribute("src", "lib/glMatrix-0.9.5.min.js");
glMatrix.setAttribute("type", "text/javascript");
document.head.appendChild(glMatrix);

define(["hiage.js/Configuration", "hiage.js/component/ComponentFactory", "hiage.js/resource/ResourceLoaderFactory"],
    function (Configuration, ComponentFactory, ResourceLoaderFactory) {

        function registerResourceLoaders(resourceLoaders) {
            for (var i = 0; i < resourceLoaders.length; i++) {
                ResourceLoaderFactory.registerResourceLoader(resourceLoaders[i].getName(), resourceLoaders[i]);
            }
        }

        function registerComponents(components) {
            for (var i = 0; i < components.length; i++) {
                ComponentFactory.registerComponent(components[i].getName(), components[i]);
            }
        }

        function Hiage(main) {
            this.main = main;
        }

        Hiage.prototype.start = function () {
            Configuration.loadConfiguration("lib/config.json")
            Configuration.loadConfiguration("lib/hiage.js/config.json")
            var that = this;
            //Register all resource loaders
            require(Configuration.resourceLoaders,
                function () {
                    registerResourceLoaders(arguments);

                    require(Configuration.components,
                        function () {
                            registerComponents(arguments);
                            that.main();
                        });
                });
        }
        
        return Hiage;
    });