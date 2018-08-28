var _ = require('lodash');
var Primus = require('primus.io');
var express = require('express');
var sizeof = require('object-sizeof');

// Web Socket
var server = require('http').createServer();
// Web Server
var expresso = express();
// Tail Service
var monitor_tail = require('./tail');

var log = require('./log');
var mock_output = require('./mock_output');

var monitor_server =
{
    // CONFIG
    // **************
    __room_display: '#display',

    // STATE
    // **************
    primus: null,
    DATA_CACHE: null,

    // METHODS
    // **************
    start: function(port_web, port_data, input_file)
    {
        // Static Service Start
        var root = __dirname + '/../www/';
        expresso.use('/', express.static(root));
        expresso.listen(port_web);
        log.info('Static Service started @:' + port_web);
        log.info('Static Service serving @:' + root);

        // Data Service Start
        this.primus = new Primus(server);
        this.primus.on('connection', this.onConnection, this);
        this.primus.on('disconnection', this.onDisconnection, this);
        server.listen(port_data);
        log.info('Data Service started @:' + port_data);

        // Tail Service Start
        monitor_tail.start(input_file, monitor_server.onTailReceiveData);
    },

    onConnection: function(spark)
    {
        // Bind connection events
        // spark.on('data', this.onData, spark); // Not used
        spark.on('ping', this.onPing, spark);

        // Save log id to spark
        spark.__id_log_string = spark.id + ' (' + spark.address.ip + ':' + spark.address.port + ')';

        // Log connection
        log.info(spark.__id_log_string + "\t" + 'connected');

        // Join display room
        spark.join(monitor_server.__room_display, function()
            {
                // Log join
                log.info(spark.__id_log_string + "\t" + 'joined');

                // Send first data
                monitor_server.data_update(spark);
            }
        );

        // Trace headers
        for(var h in spark.headers)
        {
            if(spark.headers.hasOwnProperty(h))
            {
                log.trace(h + '\t' + spark.headers[h]);
            }
        }
    },

    onDisconnection: function(spark)
    {
        // Log disconnection
        log.info(spark.__id_log_string + "\t" + 'disconnected');

        // Leave room
        spark.leave(monitor_server.__room_display, function()
            {
                log.info(spark.__id_log_string + "\t" + 'quit');
            }
        );
    },

    onData: function(data)
    {
        // Note: although attached first, this listener executes last.
        //   ex. INFO > event function
        //       DEBG < source data that occurred before INFO>
        var data_size = sizeof(data);
        log.debug(this.__id_log_string + "\t" + "< $" + data_size);
    },

    onPing: function()
    {
        // Log ping
        log.info(this.__id_log_string + "\t" + 'ping received');

        // Send data
        var MOCKUP_ENABLE = true;
        if(MOCKUP_ENABLE)
        {
            // Mock new data
            monitor_server.DATA_CACHE = mock_output.create(null);
        }
        
        // Resend
        monitor_server.data_update(this);
    },

    data_update: function(spark)
    {
        // Assert data
        if(monitor_server.DATA_CACHE === null) return;

        // Trace data
        log.trace('[data]' + "\t" + monitor_server.DATA_CACHE);

        // Check origin
        var origin;
        if(typeof(spark) === 'undefined')
        {
            // Tail Service: forward to all sockets
            origin = 'Tail';
            monitor_server.primus.room(monitor_server.__room_display).send('data_update', monitor_server.DATA_CACHE);
        }
        else
        {
            // Ping reply: resend to one socket
            origin = spark.__id_log_string;
            spark.send('data_update', monitor_server.DATA_CACHE);
        }

        // Log update
        var data_size = sizeof(monitor_server.DATA_CACHE);
        log.info(origin + "\t" + 'data update' + "\t" + '$' + data_size);
    },

    onTailReceiveData: function(data)
    {
        // Callback function from Tail Service.

        // Save data.
        monitor_server.DATA_CACHE = data;

        // Send to #display.
        monitor_server.data_update(undefined);
    }
};

module.exports = monitor_server;