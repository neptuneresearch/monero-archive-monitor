define([
    'jquery',
    'backbone.radio',
    'underscore',
    'marionette',
    'text!templates/screen.html',
    'system/clientlib',
    'views/graph_blockchains',
    'views/connect',
    'views/connected',
    'views/sync_state'

], function ($, Radio, _, Marionette, ScreenTemplate, ClientLib, GraphBlockchainsView, ConnectView, ConnectedView, SyncStateView) {
    'use strict';

    var AppChannel = Radio.channel('app');
    var DataChannel = Radio.channel('data');

    var ScreenView = Marionette.View.extend({
        __name__: 'ScreenView',
        template: _.template(ScreenTemplate),

        regions: {
            'connect': '#connect',
            'graph_blockchains': '#graph_blockchains',
            'sync_state': '#sync_state'
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
            DataChannel.on('data_update', this.data_onUpdate_Parse, this);
            AppChannel.reply('screen_animate', this.screen_animate, this);
        },

        /*
        destroy: function()
        {
            return Marionette.View.prototype.destroy.apply(this, arguments);
        },
        */

        onRender: function()
        {
            // Show Connect Form
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
                // Connect -> Connected
                this.getRegion('connect').empty().show(new ConnectedView());

                // Create graphs
                this.getRegion('graph_blockchains').show(new GraphBlockchainsView());
                this.getRegion('sync_state').show(new SyncStateView());
            }
            else
            {
                // Destroy graphs
                this.getRegion('graph_blockchains').empty();
                this.getRegion('sync_state').empty();

                // Connect form
                this.getRegion('connect').show(new ConnectView());
            }
        },

        screen_animate: function(opt)
        {
            // opt = { origin: 'viewname', el: $(view) }
            // ms default
            var ms = 150;

            // ms origin-based
            switch(opt.origin)
            {
                case 'connect_render':
                    ms = 150;
                    break;

                case 'connect_cancel':
                    ms = 50;
                    break;
            }

            // animate
            $(opt.el).hide().fadeIn(ms);
        },

        log_queue: [],
        animate_next: function()
        {
            var screen = this;

            // Animate current log message
            screen.getUI('data_log')
                .html(screen.log_queue[0])
                .fadeIn()
                .delay(1000 / screen.log_queue.length)
                .fadeOut(
                    function() 
                    { 
                        // Next log message in queue
                        screen.log_queue.splice(0,1);
                        if(screen.log_queue.length > 0) screen.animate_next();
                    }
                );    
        },

        data_onLog: function(log)
        {
            var screen = this;

            // Show log message
            console.log(log);

            // Push log
            this.log_queue.push(log);

            // Animate if not already
            if(this.log_queue.length === 1) this.animate_next();

            // Switch Screen on connected/disconnected
            if(log === 'connected' || log === 'reconnected') 
                this.screen_switch(true);
            else if(log === 'disconnected') 
                this.screen_switch(false);
        },

        data_onUpdate_Parse: function(data)
        {
            // Split data
            var outputs = data.split("\t");

            // Validate pre-read
            if(outputs.length !== 9) return DataChannel.trigger('log', 'Archive Entry Parse Fail ' + 'FIELDS_LEN ' + outputs.length);

            // Parse from string
            var archive_entry = {
                archive_version: outputs[0],
                nrt: outputs[1],
                is_alt_block: outputs[2],
                block: outputs[3],
                n_alt_chains: outputs[4],
                alt_chains_info: outputs[5],
                is_node_synced: outputs[6],
                nch: outputs[7],
                nth: outputs[8],
                monitor_entry: {
                    delta_rt: 0
                }
            };

            // Validate post-read
            if(archive_entry.archive_version !== '7') return DataChannel.trigger('log', 'Archive Entry Parse Fail ' + 'VERSION ' + archive_entry.archive_version);

            // Parse deep objects
            archive_entry.block = JSON.parse(archive_entry.block);
            archive_entry.alt_chains_info = JSON.parse(archive_entry.alt_chains_info);
            // Set Monitor entry
            archive_entry.monitor_entry.delta_rt = this.deltaRT(archive_entry.nrt, archive_entry.block.timestamp);

            // Mock 
            archive_entry.alt_chains_info = [];
            for(var i = 0; i < 12; i++)
            {
                archive_entry.alt_chains_info.push({"length":i,"height":2,"deep":2,"diff":0,"hash":"ba8bc38ba847a63b71ab8b8af7eba7ba87be87afa7bef7828ab288cb28a742" + i});
            }

            // Log Incoming Block
            DataChannel.trigger('log', 'Incoming ' + (archive_entry.is_alt_block === '1' ? 'ALT' : 'MAIN') + ' block, &#x25B3;RT=' + archive_entry.monitor_entry.delta_rt + 's');

            // Fire parsed event
            DataChannel.trigger('data_updateparsed', archive_entry);
        },

        deltaRT: function(strNRT,intMRT)
        {
            // Don't crash on errors
            try
            {
                // NRT
                var intNRT = parseInt(strNRT, 10);
                if(isNaN(intNRT)) throw null;

                // scale NRT to MRT second resolution
                var intNRT_as_seconds = Math.ceil(intNRT / 1000);
                
                // /_\
                var deltaRT = intNRT_as_seconds - intMRT;
                return deltaRT;
            }
            catch(ex)
            {
                return '?';
            }
        }
    });

    return ScreenView;
});