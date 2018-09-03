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
            DataChannel.on('data_updateparsed', this.data_onUpdateParsed, this);
        },

        destroy: function()
        {
            DataChannel.off('data_updateparsed', this.data_onUpdateParsed, this);

            return Marionette.View.prototype.destroy.apply(this, arguments);
        },

        onDomRefresh: function()
        {
            // $ Init
            // Start hidden
            $(this.el).hide();
        },

        onBeforeDetach: function()
        {
            // $ Destroy
        },

        data_onUpdateParsed: function(archive)
        {
            var show = (this.chart === null);

            // Assert chains
            if(archive.alt_chains_info.length > 0)
            {
                // Alt Chains Exist
                this.DATA_COLUMNS = [];
                for(var i = 0; i < archive.alt_chains_info.length; i++)
                {
                    this.DATA_COLUMNS.push(
                        [
                            archive.alt_chains_info[i].hash, 
                            archive.alt_chains_info[i].length
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
                            },
                            size:
                            {
                                width: 640,
                                height: 480
                            },
                            legend: { 
                                show: false
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

            // Fade in
            if(show) AppChannel.request('screen_animate', { origin: 'graph_blockchains', el: this.el });
        }
    });

    return GraphBlockchainsView;
});