define([], function() {
    function Channel() {
        this.receivers = {}
        Channel.NO_TAG = 'no_tag';
    }

    Channel.prototype.registerReceiver = function (tag, receiver) {
        if (!tag)
            tag = Channel.NO_TAG;

        if (!this.receivers[tag])
            this.receivers[tag] = [];

        this.receivers[tag].push(receiver);
    }

    Channel.prototype.deregisterReceiver = function (tag, receiver) {
        if (!tag)
            tag = Channel.NO_TAG;

        if (!this.receivers[tag])
            return;

        var index = this.receivers[tag].indexOf(receiver);
        this.receivers[tag].splice(index, 1);
    }

    Channel.prototype.sendMessage = function (message, tag) {
        this.sendMessageWithTag(message, tag);

        if (tag == Channel.NO_TAG)
            return;

        this.sendMessageWithTag(message, Channel.NO_TAG);
    }

    Channel.prototype.sendMessageWithTag = function (message, tag) {
        var receivers = this.receivers[tag];

        if (!receivers)
            return;

        for (var i = 0; i < receivers.length; i++)
            receivers[i].receiveMessage(message);
    }
    return Channel;
})