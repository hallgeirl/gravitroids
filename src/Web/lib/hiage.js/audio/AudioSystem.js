define(["jquery"], 
    function($) {
        function AudioSystem(resourceManager, channels, messageDispatcher) {
            this.resourceManager = resourceManager;
            this.channels = [];
            this.musicChannel = this.createChannel();
            this.messageDispatcher = messageDispatcher;
            this.currentChannel = 0;
            this.channelCache = {}

            messageDispatcher.registerHandler('play-sound', this);
            for (var i = 0; i < channels; i++)
                this.channels.push(this.createChannel());
        }

        AudioSystem.prototype.createChannel = function() {
            var containerElement = $(document.body)[0];
            var audioElement = document.createElement('audio');
            containerElement.appendChild(audioElement);
            return audioElement;
        }

        AudioSystem.prototype.receiveMessage = function(message) {
            var sound = this.resourceManager.getResource("audio", message.data);
            if (message.subject == 'play-sound') {
                this.playSound(sound.url);
            }
        }

        AudioSystem.prototype.playSound = function(file) {
            var channel = this.getChannel(file);

            if (channel == null) 
                return;

            if (channel.getAttribute('src') != file)
                channel.setAttribute('src', file);

            channel.play();
        }

        AudioSystem.prototype.getChannel = function(file) {
            var channel = this.getChannelFromCache(file);

            if (channel == null) {
                channel = this.getAnyChannel(file);
                if (channel != null) {
                    this.addChannelToCache(file, channel)
                }
            }
	
            return channel
        }

        AudioSystem.prototype.addChannelToCache = function(file, channel) {
            if (!this.channelCache[file]) {
                this.channelCache[file] = []
            }
	
            this.channelCache[file].push(channel)
        }

        AudioSystem.prototype.getAnyChannel = function(file) {
            for (var i = 0; i < this.channels.length; i++) {
                this.currentChannel = this.currentChannel % this.channels.length;
                var chanId = this.currentChannel++;
		
                if (!this.channels[chanId].paused)
                    continue;
        
                return this.channels[chanId];
            }
        }

        AudioSystem.prototype.getChannelFromCache = function(file) {
            if (!this.channelCache[file])
                return null
		
            for (var i = this.channelCache[file].length-1; i >= 0; i--) {
                var channel = this.channelCache[file][i];
                if (channel.getAttribute('src') != file) {
                    this.channelCache[file].splice(i, 1)
                    continue
                }

                if (channel.paused)
                    return channel;
            }
	
            return null;
        }
        return AudioSystem;
    })