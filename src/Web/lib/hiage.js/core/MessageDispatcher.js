define(["hiage.js/Channel"],
    function (Channel) {
        function MessageDispatcher() {
            this.channels = {}
        }

        MessageDispatcher.prototype.sendMessage = function (message, tag) {
            var channel = this.channels[message.subject];
            if (!channel)
                return;

            channel.sendMessage(message, tag);
        }

        MessageDispatcher.prototype.registerHandler = function (messageSubject, receiver, tag) {
            if (!this.channels[messageSubject])
                this.channels[messageSubject] = new Channel();

            this.channels[messageSubject].registerReceiver(tag, receiver);
        }

        MessageDispatcher.prototype.deregisterHandler = function (messageSubject, receiver, tag) {
            if (!this.channels[messageSubject])
                return;

            this.channels[messageSubject].deregisterReceiver(tag, receiver);
        }
        return MessageDispatcher;
    });