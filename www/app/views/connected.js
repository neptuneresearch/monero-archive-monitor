define([
    'jquery',
    'backbone.radio',
    'underscore',
    'marionette',
    'text!templates/connected.html',
    'moment'

], function ($, Radio, _, Marionette, ConnectedTemplate, moment) {
    'use strict';

    var AppChannel = Radio.channel('app');
    var DataChannel = Radio.channel('data');

    var ConnectedView = Marionette.View.extend({
        __name__: 'ConnectedView',
        template: _.template(ConnectedTemplate),

        ui:
        {
            'host_ip': '#host_ip',
            'data_update_time': '#data_update_time',
            'data_update_time_avg': '#data_update_time_avg',
            'cmdPing': '#cmdPing',
            'cmdLogout': '#cmdLogout'
        },

        events:
        {
            'click @ui.cmdPing': 'cmdPing',
            'click @ui.cmdLogout': 'cmdLogout'
        },

        data_update_time_last: 0,
        data_update_time_avg: 0,
        date_update_time_avg_n: 0,

        initialize: function()
        {
            DataChannel.on('data_update', this.data_onUpdate, this);
            DataChannel.on('data_pong', this.data_onPong, this);
        },

        destroy: function()
        {
            DataChannel.off('data_update', this.data_onUpdate, this);
            DataChannel.off('data_pong', this.data_onPong, this);

            return Marionette.View.prototype.destroy.apply(this, arguments);
        },

        onDomRefresh: function()
        {
            // Fade in
            AppChannel.request('screen_animate', { origin: 'connected', el: this.el });
        },

        data_onUpdate: function()
        {
            // Data update time
            var now = moment();
            if(this.data_update_time_last === 0) this.data_update_time_last = now;
            var data_update_time = moment(now).diff(this.data_update_time_last);
            this.data_update_time_last = now;

            // Data update time average
            //  Formula: new_average = (old_average * (n-1) + new_value) / n
            this.date_update_time_avg_n++;
            this.data_update_time_avg = Math.ceil((this.data_update_time_avg * (this.date_update_time_avg_n-1) + data_update_time) / this.date_update_time_avg_n);
            this.getUI('data_update_time_avg').html('T&#x0304; ' + this.data_update_time_avg + ' ms');

            // Data update time
            var data_update_time_last_format = moment(this.data_update_time_last).format();
            this.getUI('data_update_time').html(data_update_time_last_format);
        },

        data_onPong: function(pingTime)
        {
            // pong button
            var pongText = pingTime + ' ms';
            DataChannel.trigger('log', 'ping ' + pongText);
            this.getUI('cmdPing').addClass('pong').html(pongText).prop('disabled', true);

            // Restore ping button in 1s
            var view = this;
            setTimeout(function() { view.getUI('cmdPing').removeClass('pong').html('ping').prop('disabled', false) }, 1000);
        },

        cmdPing: function()
        {
            DataChannel.request('ping');
        },

        cmdLogout: function()
        {
            DataChannel.request('disconnect');
        }
    });

    return ConnectedView;
});