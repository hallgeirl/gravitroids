define([],
    function () {
        function ComponentFactory() {
        }

        ComponentFactory.createComponent = function (type, config, messageDispatcher, resourceManager) {
            if (!ComponentFactory.components[type])
                throw "Component of type " + type + " is not registered."

            return new ComponentFactory.components[type](config, messageDispatcher, resourceManager);
        }

        ComponentFactory.registerComponent = function (type, definition) {
            console.log("Registered component " + type);
            ComponentFactory.components[type] = definition;
        }

        ComponentFactory.components = {};

        return ComponentFactory;
    });