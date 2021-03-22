define([],
    function () {
        function Resource(type, path, name) {
            this._isLoaded = false;
            this._resource = null;
            this._type = type;
            this._name = name;
            this._path = path;
        }

        Resource.prototype.isLoaded = function () {
            return this._isLoaded;
        }

        Resource.prototype.load = function (resourceLoader) {
            this._resource = resourceLoader.loadResource(this._path, this._name)
            this._isLoaded = true;
        }

        Resource.prototype.getResource = function () {
            if (!this.isLoaded())
                throw "Cannot get resource " + this._name + " of type " + this._type + ": Resource is not loaded!"

            return this._resource;
        }

        Resource.prototype.getType = function () {
            return this._type;
        }

        return Resource;
    });