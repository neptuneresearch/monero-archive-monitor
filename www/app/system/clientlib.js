define([
    'underscore',
    'backbone.radio',
    'moment'

], function (_, Radio, moment) {
    'use strict';

    var DataChannel = Radio.channel('data');

    var ClientLib = {

        // CONFIGURATION
        // *************
        host: '',
        port: '20001',
        test_disable_connecting: false,

        // STATE
        // *************
        primus: null,
        pingTimeLast: null,

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
            // { host_ip, host_port }
            if(typeof(options) !== 'undefined') 
            {
                this.host = options.host_ip;
                this.port = options.host_port;
            }

            // Switch Connect UI
            DataChannel.trigger('connecting', this.host);

            // test_disable_connecting
            if(this.test_disable_connecting) return;

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
            DataChannel.trigger('log', 'reconnecting ...');
        },

        onReconnectScheduled: function()
        {
            DataChannel.trigger('log', 'reconnect scheduled');
        },

        onReconnected: function()
        {
            DataChannel.trigger('log', 'reconnected');
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
            DataChannel.trigger('log', 'connected');
            
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
            // Measure time elapsed since ping
            var pingTime = moment().diff(this.pingTimeLast);

            // Emit pong
            DataChannel.trigger('data_pong', pingTime);
        },

        onClose: function()
        {
            DataChannel.trigger('log', 'disconnected');

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
            // Record time
            this.pingTimeLast = moment();

            // Send ping
            ClientLib.send('ping', '');
        }
    };

    return ClientLib;
});