module.exports = controller;

const db = require('./db');
const stats = require('./stats');
const util = require('./util');
const scheduler = require('./scheduler');

const commands = {
    'stats': { 
        method: allStats, 
        syntax: 'stats [time:3h|3d|1w|2mo:1d]',
        help: 'Display stats of all users',
        rx: /!cds stats( ([0-9]+)([h|d|w|mo]))?/
    },
    'users': { 
        method: getUsers,
        syntax: 'users',
        help: 'Prints list of all registered users',
        rx: /!cds users/
    },
    'register': {
        method: registerUser,
        syntax: 'register <psn|atvi> <username>',
        help: 'Registers a new user',
        rx: /!cds register (psn|atvi) [0-9A-Za-z#_]+/ 
    },
    'unregister': { 
        method: unregisterUser, 
        syntax: 'unregister <psn|atvi> <username>', 
        help: 'Unregisters a user',
        rx: /!cds unregister (psn|atvi) [0-9A-Za-z#_]+/ 
    },
    'single': { 
        method: singleStats, 
        syntax: 'single <psn|atvi> <username> [time:3h|3d|1w|2mo:1d]',
        help: 'Display solo stats',
        rx: /!cds single (psn|atvi) [0-9A-Za-z#_]+( ([0-9]+)([h|d|w|mo]))?/
    },
    'schedule': {
        method: scheduleStats,
        syntax: 'schedule \'<cronjob>\' [time:3h|3d|1w|2mo:1d]',
        help: 'Schedule automatic stats posting',
        rx: /!cds schedule '[*\//0-9- ]+'( ([0-9]+)([h|d|w|mo]))?/
    },
    'unschedule': {
        method: unscheduleStats,
        syntax: 'unschedule',
        help: 'Unschedule automatic stats posting',
        rx: /!cds unschedule/
    },
    'help': {
        method: help,
        syntax: 'help',
        help: 'Shows this help',
        rx: /!cds help/
    }
};

async function controller(msg) {
    // trim unnecessary spaces
    msg.content = msg.content.replace(/ +/g, ' ').trim();
    
    // extract command name
    let cmd = util.tokenize(msg.content)[1];

    try {
        const command = commands[cmd];
        // check if command exists
        if (!command) {
            help(msg);
            return;
        }
        // check if syntax is okay
        if (!command.rx.test(msg.content)) {
            msg.reply(`Invalid syntax, use \`${command.syntax}\` instead.`);
            return;
        }
        // run command
        await command.method(msg);
    } catch (e) {
        msg.reply(e);
    }

}

async function allStats(msg) {
    let tokens = util.tokenize(msg.content);
    let users = await db.getAllUsers(msg.channel.id);

    // check if any users registered
    if (users.length == 0) {
        msg.reply('No users registered!');
        return;
    }
 
    // prepare reply
    let duration = util.parseDuration(tokens[2]);
    users.forEach(u => sendStats(u, 0, msg, duration)());
}

// timed-recursive function
function sendStats(u, tryn, msg, duration, err='') {
    // timeout durations for each retry
    // 9 retries for each call
    let tryWaits = new Array(3).fill([5000, 10000, 30000, 60000, 90000]).flat().sort((a, b) => a - b);

    // returns a function that can be passed to setTimeout
    return async function() {
        // if retried max times, just stop
        if (tryn >= tryWaits.length) {
            msg.channel.send(`Failed to fetch stats for ${u.username} (${u.platform}): ${err}`);
            return;
        }

        try {
            // try and send stats
            let m = await stats.getStats(u.platform, u.username, duration);
            msg.channel.send(m);
            return;
        } catch(e) {
            // API down, retry after tryWaits[tryn]
            setTimeout(sendStats(u, tryn + 1, msg, duration), tryWaits[tryn]);
        }

    }
}

async function getUsers(msg) {
    let users = await db.getAllUsers(msg.channel.id);
    users = users.map(x => `${util.escapeMarkdown(x.username)} (${x.platform})`);
    msg.reply(`\nRegistered users:\n${users.join('\n')}`);
}

async function registerUser(msg) {
    let tokens = util.tokenize(msg.content);
    await db.addUserToChannel(msg.channel.id, tokens[3], tokens[2]);
    msg.reply(`**${tokens[3]}** *(${tokens[2]})* has been registered!`);
}

async function unregisterUser(msg) {
    let tokens = util.tokenize(msg.content);
    await db.removeUserFromChannel(msg.channel.id, tokens[3], tokens[2]);
    msg.reply(`**${util.escapeMarkdown(tokens[3])}** *(${tokens[2]})* has been unregistered!`);
}

async function singleStats(msg) {
    let tokens = util.tokenize(msg.content);
    let duration = util.parseDuration(tokens[4]);
    sendStats({ platform: tokens[2], username: tokens[3] }, 0, msg, duration)();
}

async function scheduleStats(msg) {
    let rx = /!cds schedule '([*\//0-9- ]+)'( ([0-9]+)([h|d|w|mo]))?/;
    let match = msg.content.match(rx);
    let cron = match[1], time = match[2].trim();
    
    try {
        // check if cron is valid
        if (!util.isValidCron(cron)) {
            msg.reply('Invalid cron syntax!');
            return;
        }

        // schedule message
        await scheduler.schedule(msg.channel.id, cron, time);
        msg.reply('Stats scheduled!')
    } catch (e) {
        msg.reply(e);
    }
}

async function unscheduleStats(msg) {
    await scheduler.unschedule(msg.channel.id);
    msg.reply('Stats unscheduled!');
}

async function help(msg) {
    let help = '\n**COD-Daily-Stats Guide:**\n';
    for (let cmd in commands) {
        help += `\`${commands[cmd].syntax}\`: *${commands[cmd].help}*\n`;
    }
    msg.reply(help);
}