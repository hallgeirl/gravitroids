function AudioSystem(container, channels, messageDispatcher) {
    this.channels = [];
    this.musicChannel = this.createChannel(container);
    this.messageDispatcher = messageDispatcher;
    this.currentChannel = 0;

    messageDispatcher.registerHandler('play-sound', this);
    for (var i = 0; i < channels; i++)
        this.channels.push(this.createChannel(container));
}

AudioSystem.prototype.createChannel = function(container) {
    var containerElement = $('#' + container)[0];
    var audioElement = document.createElement('audio');
    containerElement.appendChild(audioElement);
    return audioElement;
}

AudioSystem.prototype.receiveMessage = function(message) {
    if (message.subject == 'play-sound') {
        this.playSound(message.data);
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
    var channel = null;
    for (var i = 0; i < this.channels.length; i++) {
        this.currentChannel = this.currentChannel % this.channels.length;
        var chanId = this.currentChannel++;

        if (!this.channels[chanId].paused)
            continue;
        
        channel = this.channels[chanId];

        if (channel.getAttribute('src') == file)
            return channel;
    }
    return channel;
}

AudioSystem.prototype.getAnyChannel = function() {
}
