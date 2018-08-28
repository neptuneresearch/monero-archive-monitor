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
            'stat_update': '#stat_update',
            'stat_fromnow': '#stat_fromnow',
            'cmdPing': '#cmdPing'
        },

        events:
        {
            'click @ui.cmdPing': 'cmdPing'
        },

        __UPDATED: null,

        initialize: function()
        {
            DataChannel.on('data_update', this.data_onUpdate, this);
        },

        destroy: function()
        {
            DataChannel.off('data_update', this.data_onUpdate, this);

            return Marionette.View.prototype.destroy.apply(this, arguments);
        },

        onDomRefresh: function()
        {

        },

        data_onUpdate: function()
        {
            // Time since last update
            var UPDATED0 = (this.__UPDATED !== null ? this.__UPDATED : moment());
            var fromNow = moment(UPDATED0).fromNow();
            this.getUI('stat_fromnow').html(fromNow);

            // Time now
            this.__UPDATED = moment();
            var now = moment(this.__UPDATED).format();
            this.getUI('stat_update').html(now);
        },

        cmdPing: function()
        {
            DataChannel.request('ping');
        }
    });

    return ConnectedView;
});