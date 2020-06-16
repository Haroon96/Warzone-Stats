module.exports = controller;

const db = require('./db');
const { sendStats } = require('./stats');
const util = require('./util');
const scheduler = require('./scheduler');

const commands = {
    'stats': { 
        method: allStats, 
        syntax: 'stats [time:3h|3d|1w|2m:1d]',
        help: 'Display stats of all registered users',
        rx: /^!wz stats( ([0-9]+)([h|d|w|m]))?$/
    },
    'users': { 
        method: getUsers,
        syntax: 'users',
        help: 'Prints list of all registered users',
        rx: /^!wz users$/
    },
    'register': {
        method: registerUser,
        syntax: 'register <psn|atvi> <username>',
        help: 'Registers a new user',
        rx: /^!wz register (psn|atvi) [0-9A-Za-z#_-]+$/
    },
    'unregister': { 
        method: unregisterUser, 
        syntax: 'unregister <psn|atvi> <username>', 
        help: 'Unregisters a user',
        rx: /^!wz unregister (psn|atvi) [0-9A-Za-z#_-]+$/ 
    },
    'single': { 
        method: singleStats, 
        syntax: 'single <psn|atvi> <username> [time:3h|3d|1w|2m:1d]',
        help: 'Display solo stats',
        rx: /^!wz single (psn|atvi) [0-9A-Za-z#_-]+( ([0-9]+)([h|d|w|m]))?$/
    },
    'schedule': {
        method: scheduleStats,
        syntax: 'schedule \'<cronjob>\' [time:3h|3d|1w|2m:1d]',
        help: 'Schedule automatic stats posting',
        rx: /^!wz schedule '[*\//0-9- ]+'( ([0-9]+)([h|d|w|m]))?$/
    },
    'unschedule': {
        method: unscheduleStats,
        syntax: 'unschedule',
        help: 'Unschedule automatic stats posting',
        rx: /^!wz unschedule$/
    },
    'help': {
        method: help,
        syntax: 'help',
        help: 'Shows this help',
        rx: /^!wz help$/
    },
    'teams': {
        method: teamSplit,
        syntax: 'teams <players-per-team>',
        help: 'Randomly splits users into teams',
        rx: /^!wz teams [0-9]+$/
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
            msg.reply(`Invalid syntax, use \`!wz ${command.syntax}\` instead.\nSend \`!wz help\` for more information.`);
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

    let i = 0;
    // for each user, call the sendStats function with a 3s delay to prevent API exhaustion
    users.forEach(async(u) => { 
        // send initial message for further editing
        let msgObj = await msg.reply(`Fetching stats for **${util.escapeMarkdown(u.username)}** (${u.platform})...`);
        setTimeout(sendStats(u, 0, msgObj, duration), i++ * 3000)
    });
}

async function getUsers(msg) {
    let users = await db.getAllUsers(msg.channel.id);
    users = users.map(x => `${util.escapeMarkdown(x.username)} (${x.platform})`);
    msg.reply(`\nRegistered users:\n${users.join('\n')}`);
}

async function registerUser(msg) {
    let tokens = util.tokenize(msg.content);
    let u = {
        username: tokens[3],
        platform: tokens[2]
    }

    await db.addUserToChannel(msg.channel.id, u.username, u.platform);
    msg.reply(`**${u.username}** *(${u.platform})* has been registered!`);    
}

async function unregisterUser(msg) {
    let tokens = util.tokenize(msg.content);
    await db.removeUserFromChannel(msg.channel.id, tokens[3], tokens[2]);
    msg.reply(`**${util.escapeMarkdown(tokens[3])}** *(${tokens[2]})* has been unregistered!`);
}

async function singleStats(msg) {
    let tokens = util.tokenize(msg.content);
    let duration = util.parseDuration(tokens[4]);
    
    let u = {
        username: tokens[3],
        platform: tokens[2]
    };

    let msgObj = await msg.reply(`Fetching stats for **${util.escapeMarkdown(u.username)}** (${u.platform})...`);
    await sendStats(u, 0, msgObj, duration)(); 
}

async function scheduleStats(msg) {
    let rx = /^!wz schedule '([*\//0-9- ]+)'( ([0-9]+)([h|d|w|m]))?/;
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
    let help = '\n**Warzone Stats Guide:**\n';
    for (let cmd in commands) {
        help += `\`${commands[cmd].syntax}\`: *${commands[cmd].help}*\n`;
    }
    help += 'For issues or feedback, feel free to report here https://github.com/Haroon96/warzone-stats/issues'
    msg.reply(help);
}

async function teamSplit(msg) {
    let perTeam = parseInt(util.tokenize(msg.content)[2]);
    let users = await db.getAllUsers(msg.channel.id);
    users = util.shuffle(users);
    try {
        let reply = [];
        let teamNum = 1;
        for (let i = 0; i < users.length; ++i) {
            if (i % perTeam == 0) {
                reply.push(`\nTeam ${teamNum}`);
                teamNum++;
            }
            reply.push(`> ${util.escapeMarkdown(users[i].username)} (${users[i].platform})`);
        }
        msg.reply(reply.join('\n'));
    } catch (e) { 
        msg.reply(`Failed to split teams! ${e}`);
    }
}