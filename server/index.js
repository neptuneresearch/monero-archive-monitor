var __MONITOR_VERSION = '1.0';
var __PORT_WEB = process.argv[2] || 20000;
var __PORT_DATA = process.argv[3] || 20001;
var __INPUT_FILE = process.argv[4] || '/opt/monerodarchive/archive.log';

var log = require('./log');
log.level = 30;
// note: delete 1 space at half width point to align top line
log.info("\n\n"
    + 'N e p t u n e    R e s e a r c h' 
    + "\n"
    + 
    `
 _  _  _  _ _ _  _| __  _  _ _|_ .   _ __  _  _  _ .|_ _  _ 
|||(_)| )(-| (_)(_|    (_|| (_| )|\/(-    |||(_)| )||_(_)|                                                             
    `
    + "\n"
    + '                                                        ' + __MONITOR_VERSION + "\n"
);

var monitor_server = require('./server');
monitor_server.start(__PORT_WEB, __PORT_DATA, __INPUT_FILE);