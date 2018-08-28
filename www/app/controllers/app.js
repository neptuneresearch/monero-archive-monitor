define([
    'backbone.radio',
    'views/screen',

], function (Radio,
             ScreenView)
{
    'use strict';

    var AppChannel = Radio.channel('app');

    var AppController = {

        start: function()
        {
            var route = '';

            AppChannel.request('view:show', new ScreenView());
        }
    };

    return AppController;

});
