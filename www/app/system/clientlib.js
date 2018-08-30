define([
    'underscore',
    'backbone.radio',

], function (_, Radio) {
    'use strict';

    var DataChannel = Radio.channel('data');

    var ClientLib = {

        // CONFIGURATION
        // *************
        host: '',
        port: '20001',

        // STATE
        // *************
        primus: null,

        initialize: function()
        {
            // Default host to origin
            this.host = window.location.hostname;

            // Bind events; ClientLib never destructs
            DataChannel.reply('connect', this.connect, this);
            DataChannel.reply('disconnect', this.disconnect, this);
            DataChannel.reply('host', this.host, this);
        },

        connect: function(options)
        {
            // Switch Connect UI
            DataChannel.trigger('connecting');

            // { host_ip, host_port }
            if(typeof(options) !== 'undefined') 
            {
                this.host = options.host_ip;
                this.port = options.host_port;
            }

            // Connect now
            this.primus = Primus.connect('http://' + this.host + ':' + this.port);

            // Server events
            this.primus.on('open', this.onOpen, this);
            this.primus.on('close', this.onClose, this);
            this.primus.on('reconnect', this.onReconnect, this);
            this.primus.on('reconnect scheduled', this.onReconnectScheduled, this);
            this.primus.on('error', this.onError, this);
            this.primus.on('reconnected', this.onReconnected, this);

            // Ui events
            DataChannel.reply('ping', this.ping, this);
        },

        disconnect: function()
        {
            this.primus.end();

            this.primus = null;
        },

        onReconnect: function()
        {
            console.log('Data Service: reconnecting ...');
        },

        onReconnectScheduled: function()
        {
            console.log('Data Service: reconnect scheduled');
        },

        onReconnected: function()
        {
            console.log('Data Service: reconnected');
        },

        onError: function(error)
        {
            console.log('Data Service: error: ' + error);
        },

        host: function()
        {
            return this.host;
        },

        onOpen: function()
        {
            DataChannel.trigger('connected');
            console.log('Data Service: connected');
            
            // Connection events
            this.primus.on('data_update', this.onDataUpdate, this);
            this.primus.on('pong', this.onPong, this);
        },

        onDataUpdate: function(data) 
        {
            var data_str = JSON.stringify(data);

            // Emit data
            DataChannel.trigger('data_update', data);
        },

        onPong: function()
        {
            // Emit pong
            DataChannel.trigger('data_pong');
        },

        onClose: function()
        {
            DataChannel.trigger('disconnected');
            console.log('Data Service: disconnected');

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