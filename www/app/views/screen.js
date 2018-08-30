define([
    'jquery',
    'backbone.radio',
    'underscore',
    'marionette',
    'text!templates/screen.html',
    'system/clientlib',
    'views/graph_blockchains',
    'views/connect',
    'views/connected'

], function ($, Radio, _, Marionette, ScreenTemplate, ClientLib, GraphBlockchainsView, ConnectView, ConnectedView) {
    'use strict';

    var AppChannel = Radio.channel('app');
    var DataChannel = Radio.channel('data');

    var ScreenView = Marionette.View.extend({
        __name__: 'ScreenView',
        template: _.template(ScreenTemplate),

        regions: {
            'connect': '#connect',
            'graph_blockchains': '#graph_blockchains'
        },

        ui:
        {
            'data_log': '#data_log'
        },

        events:
        {

        },

        initialize: function()
        {
            DataChannel.on('log', this.data_onLog, this);
        },

        destroy: function()
        {
            DataChannel.off('connected', this.data_onConnected, this);
            DataChannel.off('disconnected', this.data_onDisconnected, this);

            return Marionette.View.prototype.destroy.apply(this, arguments);
        },

        onRender: function()
        {
            // Offer Connect via simulated disconnect
            this.screen_switch(false);
        },

        onDomRefresh: function()
        {
            // Autoconnect on Screen Load
            DataChannel.request('connect');
        },

        onBeforeDetach: function()
        {
            // $ UNBIND
        },

        screen_switch: function(isConnected)
        {
            if(isConnected)
            {
                this.getRegion('connect').empty().show(new ConnectedView());
                this.getRegion('graph_blockchains').show(new GraphBlockchainsView());
            }
            else
            {
                this.getRegion('graph_blockchains').empty();
                this.getRegion('connect').show(new ConnectView());
            }
        },

        data_onLog: function(log)
        {
            // Show log message
            this.getUI('data_log').html(log).fadeIn().delay(1000).fadeOut();

            // Switch Screen on connected/disconnected
            if(log === 'connected') 
                this.screen_switch(true);
            else if(log === 'disconnected') 
                this.screen_switch(false);
        }
    });

    return ScreenView;
});