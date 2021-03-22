define([],
    function () {
        function Message(subject, data, sender) {
            this.subject = subject;
            this.data = data;
            this.sender = sender;
        }
        return Message;
    });