define([
    'jquery',
    'backbone.radio',
    'underscore',
    'marionette',
    'text!templates/connect.html',
    'system/clientlib',

], function ($, Radio, _, Marionette, ConnectTemplate, ClientLib) {
    'use strict';

    var AppChannel = Radio.channel('app');

    var ConnectView = Marionette.View.extend({
        __name__: 'ConnectView',
        template: _.template(ConnectTemplate),

        ui:
        {
            'hostbox': '#hostbox',
            'txt_ip': '#txt_ip',
            'txt_port': '#txt_port',
            'cmdConnect': '#cmdConnect'
        },

        events:
        {
            'click @ui.cmdConnect': 'cmdConnect'
        },

        cmdConnect: function()
        {
            var host_ip = this.getUI('txt_ip').val();
            var host_port = this.getUI('txt_port').val();

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

            // Disable UI until connected
            this.getUI('txt_ip').attr('disabled', 'disabled').addClass('disabled-dim');
            this.getUI('txt_port').attr('disabled', 'disabled').addClass('disabled-dim');
            this.getUI('cmdConnect').attr('disabled', 'disabled').addClass('disabled-dim');

            // Connect
            ClientLib.connect(host_ip);
        }
    });

    return ConnectView;
});