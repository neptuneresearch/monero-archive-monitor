define([
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'system/clientlib',

], function ($, Backbone, Radio, Marionette, ClientLib) {
    'use strict';

    var AppChannel = Radio.channel('app');

    var App = Marionette.Application.extend({
        __name__: 'AppApplication',
        root: '',
        region: {
            el: '#app',
            __name__: 'AppApplicationRegionApp'
        },
        channelName: 'app',

        radioRequests: {
            'view:show': 'viewShow',
            'view:showChild': 'viewShowChild'
        },

        initialize: function (options)
        {
            
        },

        onStart: function (app, options) 
        {
            Backbone.history.start
            (
                {
                    pushState: false, 
                    root: app.root
                }
            );
        },

        viewShow: function(view)
        {
            this.showView(view);
        },

        viewShowChild: function(options)
        {
            var view = this.getView();
            if(typeof(view) !== 'undefined')
            {
                if(typeof(view.onShowChildView) == 'function') view.onShowChildView(options.route);
                view.showChildView(options.region, options.childView);
            }
        }
    });

    return App;
});