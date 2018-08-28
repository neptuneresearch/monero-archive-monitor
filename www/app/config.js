'use strict';

require.config({
    deps: ['system/main'],

    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        marionette: {
            deps: ['backbone', 'backbone.radio'],
            exports: 'Backbone.Marionette'
        },
        'd3': {
            exports: 'd3',
    
            init: function() {
    
                window.d3 = d3;
    
            }
        }
    },
    paths: {
        c3: '../js/c3.min',
        d3: '../js/d3.v5.min',
        fastclick: '../js/fastclick',
        jquery: '../js/jquery-3.1.1.min',
        underscore: '../js/underscore-min',
        lodash: '../js/lodash.min',
        backbone: '../js/backbone-min',
        'backbone.radio': '../js/backbone.radio.min',
        marionette: '../js/backbone.marionette.min',
        moment: '../js/moment.min',
        text: '../js/text',
        TraceKit: '../js/tracekit'
    }
});