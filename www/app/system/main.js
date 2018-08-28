define([
    'jquery',
    'fastclick',
    // 'TraceKit',
    'backbone.radio',
    'system/app',
    'routers/app'
], function ($, FastClick, /* TraceKit, */ Radio, App, AppRouter)
{
    'use strict';

    var AppChannel = Radio.channel('app');

    // Reset to Start on app reload
    window.location.href = '#';

    // Init TraceKit
    /*
    TraceKit.report.subscribe(function (errorReport) {
        $('body').addClass('dump').html(JSON.stringify(errorReport,null,2).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;'));
    });
    */

    // Resize
    function onResize(e)
    {
        AppChannel.trigger('window:resize', e);
    }

    // Document Ready
    $(function() {
        // Bind Resize
        window.addEventListener("resize", onResize, false);

        // FastClick
        if ('ontouchstart' in window) {
            FastClick.attach(document.body);
        }

        // Init App
        var app = new App({ Router: new AppRouter() });
        app.start();
    });
});