define([
    'backbone',
    'marionette',
    'backbone.radio',
    'controllers/app'

], function (Backbone, Marionette, Radio, AppController) {
    'use strict';

    var AppChannel = Radio.channel('app');

    var AppRouter = Backbone.Marionette.AppRouter.extend({
        __name__: 'AppRouter',
        controller: AppController,

        appRoutes: {
            '': 'start',
        }
    });

    return AppRouter;
});