define(["jquery"],
    function ($) {
        function Configuration() {
        }

        Configuration.loadConfiguration = function (path) {
            console.log("Reading configuration " + path);
            $.ajax({
                url: path,
                dataType: "json",
                async: false,
                success: function (data) {
                    if (data["modules"])
                        loadModules(data["modules"])
                },
                error: function (data) {
                    console.log("Configuration at " + path + " could not be loaded.");
                }
            });
        }

        Configuration.resourceLoaders = []
        Configuration.components = []
        
        function loadModules(modules) {
            if (modules["resourceloaders"]) {
                for (var i = 0; i < modules.resourceloaders.length; i++) {
                    console.log("Adding resource loader " + modules.resourceloaders[i]);
                    Configuration.resourceLoaders.push(modules.resourceloaders[i]);
                }
            }
            if (modules["components"]) {
                for (var i = 0; i < modules.components.length; i++) {
                    console.log("Adding component " + modules.components[i]);
                    Configuration.components.push(modules.components[i]);
                }
            }
        }
        
        return Configuration
    });