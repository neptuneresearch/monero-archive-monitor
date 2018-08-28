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
            var DEBUG = false;

            // Split data
            var outputs = data.split("\t");
            var alt_chains_info_json = outputs[4];
            if(DEBUG) this.getUI('json').html(alt_chains_info_json);
            var alt_chains_info = JSON.parse(alt_chains_info_json);

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

        }
    });

    return GraphBlockchainsView;
});