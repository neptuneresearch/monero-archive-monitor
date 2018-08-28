var _ = require('lodash');
var log = require('./log');
var Tail = require('tail').Tail;
var sizeof = require('object-sizeof');

const fs = require('fs');
const readline = require('readline');
const Stream = require('stream');

var monitor_tail = 
{
    // CONFIGURATION
    // *************
    input_file: '',

    // STATE
    // *************
    monitor_server_callback: _.noop,

    // METHODS
    // *************
    start: function(input_file, monitor_server_callback)
    {
        // Save server callback
        this.input_file = input_file;
        this.monitor_server_callback = monitor_server_callback;

        // Tail start
        //  Note: options available as second parameter: { logger: log }
        var tail = new Tail(this.input_file);
        tail.on('line', _.bind(this.tail_onLine, this));
        tail.on('error', _.bind(this.tail_onError, this));

        // Log start
        log.info('Tail Service started @' + this.input_file);

        // Read tail now
        this.tail_read();
    },

    tail_onLine: function(data)
    {
        // Log disabled - the callback logs
        //var data_size = sizeof(data);
        //log.debug('[tail]' + "\t" + "$" + data_size);

        // Upload new line
        this.monitor_server_callback(data);
    },

    tail_onError: function(error) 
    {
        // Log error
        log.fatal('Tail error: ' + error);
    },

    tail_read: function()
    {
        log.info('Tail reading...');

        var inStream = fs.createReadStream(this.input_file);
        var outStream = new Stream;
        var rl = readline.createInterface(inStream, outStream);
        var tail = '';
        var monitor_tail = this;

        rl.on('line', 
            function(line) 
            {
                if (line.length >= 1) tail = line;
            }
        );

        rl.on('error', function(err)
            {
                // TODO - what data type is err?
                log.fatal('tail_read: ' + err.toString());
            }
        );

        rl.on('close', function() 
            {
                log.info('Tail acquired');
                monitor_tail.monitor_server_callback(tail);
            }
        );
    }
};

module.exports = monitor_tail;