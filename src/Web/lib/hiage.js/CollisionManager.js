define(["hiage.js/core/Message"],
    function (Message) {
        function CollisionManager(messageDispatcher) {
            this.collidables = [];
            this.messageDispatcher = messageDispatcher;
            this.messageDispatcher.registerHandler('register-collision-target', this);
            this.messageDispatcher.registerHandler('unregister-collision-target', this);
        }

        CollisionManager.prototype.receiveMessage = function (message) {
            if (message.subject == 'unregister-collision-target')
                this.unregister(message.data);
            else if (message.subject == 'register-collision-target')
                this.register(message.data);
        }

        CollisionManager.prototype.register = function (obj) {
            this.collidables.push(obj);
        }

        CollisionManager.prototype.unregister = function (obj) {
            for (var i = 0; i < this.collidables.length; i++) {
                if (obj.id == this.collidables[i].object.id) {
                    this.collidables.splice(i, 1);
                    break;
                }
            }
        }

        CollisionManager.prototype.checkCollisions = function () {
            this.sortObjects();
            this.i = this.i ? this.i + 1 : 1;

            for (var i = 0; i < this.collidables.length; i++) {
                var obj1 = this.collidables[i];
                if (!obj1.collisionBox)
                    continue;

                var bottom1 = obj1.collisionBox.position[1] - obj1.collisionBox.radius;

                for (var j = i + 1; j < this.collidables.length; j++) {
                    var obj2 = this.collidables[j];
                    if (!obj2.collisionBox)
                        continue;

                    var top2 = obj2.collisionBox.position[1] + obj2.collisionBox.radius;
                    
                    if (bottom1 > top2)
                        break;
                    
                    var radius = obj1.collisionBox.radius + obj2.collisionBox.radius;
                    var pos1 = obj1.collisionBox.position;
                    var pos2 = obj2.collisionBox.position;

                    if (radius >= vectorLength(vectorDifference(pos1, pos2))) {
                        this.messageDispatcher.sendMessage(new Message('collide', { other: obj2.object }, this), obj1.object.id);
                        this.messageDispatcher.sendMessage(new Message('collide', { other: obj1.object }, this), obj2.object.id);
                    }
                }
            }
        }

        function objectCompare(obj1, obj2) {
            var top1 = obj1.collisionBox.position[1] - obj1.collisionBox.radius;
            var top2 = obj2.collisionBox.position[1] - obj2.collisionBox.radius;
            return top2 - top1;
        }

        CollisionManager.prototype.sortObjects = function (frameTime) {
            for (var i = 1; i < this.collidables.length; i++) {
                var obj1 = this.collidables[i];
                var top1 = obj1.collisionBox.position[1] + obj1.collisionBox.radius;
                var j = i - 1;
                var done = false;

                do {
                    var obj2 = this.collidables[j];
                    var top2 = obj2.collisionBox.position[1] + obj2.collisionBox.radius;
                    if (top1 > top2) {
                        this.collidables[j + 1] = this.collidables[j];
                        j--;
                        if (j < 0)
                            done = true;
                    }
                    else
                        done = true;
                } while (!done);

                this.collidables[j + 1] = obj1;
            }
        }
        return CollisionManager;
    })