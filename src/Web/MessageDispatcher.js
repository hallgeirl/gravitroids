function Channel() {
    this.receivers = {}
    Channel.NO_TAG = 'no_tag';
}

Channel.prototype.registerReceiver = function(tag, receiver) {
    if (!tag)
        tag = Channel.NO_TAG;

    if (!this.receivers[tag])
        this.receivers[tag] = [];

    this.receivers[tag].push(receiver);
}

Channel.prototype.sendMessage = function(message, tag) {
    this.sendMessageWithTag(message, tag);

    if (tag == Channel.NO_TAG)
        return;

    this.sendMessageWithTag(message, Channel.NO_TAG);
}

Channel.prototype.sendMessageWithTag = function(message, tag) {
    var receivers = this.receivers[tag];

    if (!receivers)
        return;

    for (var i = 0; i < receivers.length; i++)
        receivers[i].receiveMessage(message);
}

function MessageDispatcher() {
    this.channels = {}
}

MessageDispatcher.prototype.sendMessage = function(message, tag) {
    var channel = this.channels[message.subject];
    if (!channel)
        return;

    channel.sendMessage(message, tag);
}

MessageDispatcher.prototype.registerHandler = function(messageSubject, receiver, tag) {
    if (!this.channels[messageSubject])
        this.channels[messageSubject] = new Channel();

    this.channels[messageSubject].registerReceiver(tag, receiver);
}
