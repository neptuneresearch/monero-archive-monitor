define([
    'jquery',
    'backbone.radio',
    'underscore',
    'marionette',
    'text!templates/sync_state.html',
    'moment'

], function ($, Radio, _, Marionette, SyncStateTemplate, moment) {
    'use strict';

    var AppChannel = Radio.channel('app');
    var DataChannel = Radio.channel('data');

    var SyncStateView = Marionette.View.extend({
        __name__: 'SyncStateView',
        template: _.template(SyncStateTemplate),

        ui:
        {
            'data_syncpercent': '#data_syncpercent'
        },

        events:
        {
        },

        initialize: function()
        {
            DataChannel.on('data_updateparsed', this.data_onUpdateParsed, this);
        },

        destroy: function()
        {
            DataChannel.off('data_updateparsed', this.data_onUpdateParsed, this);

            return Marionette.View.prototype.destroy.apply(this, arguments);
        },

        onDomRefresh: function()
        {
            // Fade in
            AppChannel.request('screen_animate', { origin: 'sync_state', el: this.el });
        },

        data_onUpdateParsed: function(archive)
        {
            var syncpercent = Math.ceil(archive.nch * 100 / archive.nth);
            if(syncpercent > 100) 
            {
                syncpercent = '+' + (archive.nch - archive.nth);
            }
            else
            {
                syncpercent = syncpercent + '%';
            }

            var sync_full = (archive.is_node_synced ? 'FULL' : 'SYNC');

            this.getUI('data_syncpercent')
                .html(archive.nch + '/' + archive.nth + ' ' + sync_full + ' ' + syncpercent)
                .toggleClass('SYNC', !sync_full)
                .toggleClass('FULL', sync_full);
        }
    });

    return SyncStateView;
});