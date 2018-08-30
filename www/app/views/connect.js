define([
    'jquery',
    'backbone.radio',
    'underscore',
    'marionette',
    'text!templates/connect.html',

], function ($, Radio, _, Marionette, ConnectTemplate) {
    'use strict';

    var AppChannel = Radio.channel('app');
    var DataChannel = Radio.channel('data');

    var ConnectView = Marionette.View.extend({
        __name__: 'ConnectView',
        template: _.template(ConnectTemplate),

        ui:
        {
            'hostbox': '#hostbox',
            'loadbox': '#loadbox',
            'txt_ip': '#txt_ip',
            'txt_port': '#txt_port',
            'cmdConnect': '#cmdConnect'
        },

        events:
        {
            'click @ui.cmdConnect': 'cmdConnect',
            'click @ui.cmdCancel': 'cmdCancel',
        },

        initialize: function()
        {
            DataChannel.on('connecting', this.data_onConnecting, this);
        },

        destroy: function()
        {
            DataChannel.off('connecting', this.data_onConnecting, this);

            return Marionette.View.prototype.destroy.apply(this, arguments);
        },

        onDomRefresh: function()
        {
            // Default host
            this.getUI('txt_ip').val(DataChannel.request('host'));
        },

        cmdConnect: function()
        {
            var host_ip = this.getUI('txt_ip').val();
            var host_port = this.getUI('txt_port').val();

            // Validate
            if(host_ip.length === 0)
            {
                alert('Host required');
                return;
            }

            if(host_port.length === 0)
            {
                alert('Port required');
                return;
            }

            // Connect
            DataChannel.request('connect', { host_ip: host_ip, host_port: host_port });
        },

        data_onConnecting: function()
        {
            this.getUI('hostbox').hide();
            this.getUI('loadbox').show();
        },

        cmdCancel: function()
        {
            this.getUI('loadbox').hide();
            this.getUI('hostbox').show();
        }
    });

    return ConnectView;
});