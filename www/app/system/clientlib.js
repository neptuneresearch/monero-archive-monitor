define([
    'underscore',
    'backbone.radio',

], function (_, Radio) {
    'use strict';

    var DataChannel = Radio.channel('data');

    var ClientLib = {

        // CONFIGURATION
        // *************
        host: '127.0.0.1',
        port: '20001',

        // STATE
        // *************
        primus: null,

        connect: function(ASK_HOST)
        {
            if(typeof(ASK_HOST) === 'undefined') ASK_HOST = this.host;
            this.host = ASK_HOST;

            // Connect now
            this.primus = Primus.connect('http://' + this.host + ':' + this.port);

            // Server events
            this.primus.on('open', this.onOpen, this);
            this.primus.on('close', this.onClose, this);

            // Ui events
            DataChannel.reply('ping', this.ping, this);
        },

        onOpen: function()
        {
            DataChannel.trigger('connected');
            
            // Connection events
            this.primus.on('data_update', this.onDataUpdate, this);
        },

        onDataUpdate: function(data) 
        {
            var data_str = JSON.stringify(data);

            // Emit data
            DataChannel.trigger('data_update', data);
        },

        onClose: function()
        {
            DataChannel.trigger('disconnected');

            // Unbind
            this.primus.off('open', this.onOpen, this);
            this.primus.off('close', this.onClose, this);
            this.primus.off('data_update', this.onDataUpdate, this);
            DataChannel.stopReplying('ping', this.ping, this);
        },

        send: function(event, data)
        {
            if(this.primus === null) return;

            this.primus.send(event, data);            
        },

        ping: function()
        {
            ClientLib.send('ping', '');
        }
    };

    return ClientLib;
});