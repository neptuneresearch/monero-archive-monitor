var pino = require('pino');
var moment = require('moment');
var chalk = require('chalk');

var pretty = pino.pretty({
    formatter: function (value) {
        var levels = {
            default: 'USERLVL',
            60: 'FAIL',
            50: 'ERR ',
            40: 'WARN',
            30: 'INFO',
            20: 'DEBG',
            10: 'TRCE'
        }

        var line = '';
        var m = moment(value.time);

        var time = m.format('M.D.HH.mm.ss.SSSS');
        var level = levels[value.level];

        return (level < 60 ? clr(time + ' ', value) + chalk.inverse(clr(' ' + level + ' ', value)) + clr(' ' + value.msg, value)
                :   clr(time + ' ' + level + ' ' + value.msg, value));

        function clr(line, value) {
            switch (value.level) {
                case 10: //TRACE
                    return chalk.magenta(line);

                case 20: //DEBUG
                    return chalk.cyan(line);

                case 30: //INFO
                    return chalk.green(line);

                case 40: //WARN
                    return chalk.yellow(line);

                case 50: //ERROR
                    return chalk.red(line);

                case 60: //FATAL
                    return chalk.bgRed.black(line);
            }
        }
    }
});
pretty.pipe(process.stdout);

var log = pino({
    name: 'app',
    safe: true
}, pretty);

// KEYPRESS
var keypress = require('keypress');
keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {

    var loglevel = {'1': 'trace','2':'debug','3':'info','4':'warn','5':'error','6':'fatal'};
    switch(ch)
    {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
            log.level = loglevel[ch];
            log.info('Log level set to ' + loglevel[ch].toUpperCase());
            break;
    }
});
log.info('Press 1-6 to change log level (1 trace,2 debug,3 info,4 warn,5 error,6 fatal)');

module.exports = log;