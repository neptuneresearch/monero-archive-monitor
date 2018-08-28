var n_alt_chains = process.argv[2] || null;

// Requires
const fs = require('fs');
const mock_output = require('../server/mock_output');

// Create output
var mock_output_string = mock_output.create(n_alt_chains);

// Write output
var __ARCHIVE_OUTPUT_FILENAME = '/opt/monerodarchive/archive.log';
fs.appendFile(__ARCHIVE_OUTPUT_FILENAME, mock_output_string, 
    function (err) 
    {
        if (err) throw err;
        console.log('Output created');
    }
);