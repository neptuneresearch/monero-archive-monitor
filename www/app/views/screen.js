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
        },

        events:
        {

        },

        initialize: function()
        {
            DataChannel.on('connected', this.data_onConnected, this);
            DataChannel.on('disconnected', this.data_onDisconnected, this);
        },

        destroy: function()
        {
            DataChannel.off('connected', this.data_onConnected, this);
            DataChannel.off('disconnected', this.data_onDisconnected, this);

            return Marionette.View.prototype.destroy.apply(this, arguments);
        },

        onRender: function()
        {
            // Offer Connect
            this.data_onDisconnected();
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

        data_onConnected: function()
        {
            this.getRegion('connect').empty().show(new ConnectedView());
            this.getRegion('graph_blockchains').show(new GraphBlockchainsView());
        },

        data_onDisconnected: function()
        {
            this.getRegion('graph_blockchains').empty();
            this.getRegion('connect').show(new ConnectView());
        }
    });

    return ScreenView;
});