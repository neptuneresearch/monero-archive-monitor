define([
    'jquery',
    'backbone.radio',
    'underscore',
    'marionette',
    'text!templates/graph_blockchains.html',
    'system/clientlib',
    'd3',
    'c3'

], function ($, Radio, _, Marionette, GraphBlockchainsTemplate, ClientLib, d3, c3) {
    'use strict';

    var AppChannel = Radio.channel('app');
    var DataChannel = Radio.channel('data');

    var GraphBlockchainsView = Marionette.View.extend({
        __name__: 'GraphBlockchainsView',
        template: _.template(GraphBlockchainsTemplate),

        // STATE
        chart: null,
        DATA_COLUMNS: [],

        // Marionette
        ui:
        {
            'json': '#json'
        },

        events:
        {
        },

        initialize: function(options)
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
            // $ Init
        },

        onBeforeDetach: function()
        {
            // $ Destroy
        },

        data_onUpdate: function(data)
        {
            // Split data
            var outputs = data.split("\t");
            var alt_chains_info_json = outputs[4];
            var alt_chains_info = JSON.parse(alt_chains_info_json);

            // Show Is Alt Block? field
            var is_alt_block = outputs[1];
            var deltaRT = this.deltaRT(outputs[0], outputs[2]);
            DataChannel.trigger('log', 'Incoming ' + (is_alt_block === '1' ? 'ALT' : 'MAIN') + ' block, &#x25B3;RT=' + deltaRT + 's');

            // Assert chains
            if(alt_chains_info.length > 0)
            {
                // Alt Chains Exist
                this.DATA_COLUMNS = [];
                for(var i = 0; i < alt_chains_info.length; i++)
                {
                    this.DATA_COLUMNS.push(
                        [
                            alt_chains_info[i].hash, 
                            alt_chains_info[i].length
                        ]
                    );
                }
   
                // Rerender
                if(this.chart !== null)
                {
                    this.chart.load(
                        {
                            columns: this.DATA_COLUMNS
                        }
                    );
                }
                else
                {
                    // Render c3 chart
                    this.chart = c3.generate(
                        {
                            bindto: '#chart',
                            data: {
                                columns: this.DATA_COLUMNS,
                                type: 'bar'
                            },
                            axis: 
                            {
                                x: 
                                {
                                    label: 'chain'
                                },
                                y: 
                                {
                                    label: 'length'
                                }
                            }
                        }
                    );
                }
            }
            else
            {
                // Alt Chains Empty
                this.chart = null;
                $('#chart').empty().html('no alternate chains');
            }

        },

        deltaRT: function(strNRT,strBlockJson)
        {
            // Don't crash on errors
            try
            {
                // NRT
                var intNRT = parseInt(strNRT, 10);
                if(isNaN(intNRT)) throw null;

                // scale NRT to MRT second resolution
                var intNRT_as_seconds = Math.ceil(intNRT / 1000);

                // MRT
                var block = JSON.parse(strBlockJson);
                if(typeof(block) !== 'object') throw null;
                var MRT = block.timestamp;
                
                // /_\
                var deltaRT = intNRT_as_seconds - MRT;
                return deltaRT;
            }
            catch(ex)
            {
                return '?';
            }
        }
    });

    return GraphBlockchainsView;
});