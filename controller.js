module.exports = controller;

const db = require('./db');
const stats = require('./stats');
const util = require('./util');

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
    let replies = [];
    let errors = [];
    for (let u of users) {
        try {
            let duration = util.parseDuration(tokens[2]);
            let pStats = await stats.getStats(u.platform, u.username, duration);
            replies.push(util.pprint(util.escapeMarkdown(u.username), pStats, duration));
        } catch (e) {
            u.error = e;
            errors.push(u);
        }
    }
    if (replies.length > 0) {
        msg.reply('\n' + replies.join('\n'));
    }
    if (errors.length > 0) {
        msg.reply('\nEncountered errors while fetching for: \n' + 
            errors.map(x => `${util.escapeMarkdown(x.username)} (${x.platform}): \`${x.error}\``).join('\n'));
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
    let pStats = await stats.getStats(tokens[2], tokens[3], duration);
    msg.reply('\n' + util.pprint(util.escapeMarkdown(tokens[3]), pStats, duration));
}

async function help(msg) {
    let help = '\n**COD-Daily-Stats Guide:**\n';
    for (let cmd in commands) {
        help += `\`${commands[cmd].syntax}\`: *${commands[cmd].help}*\n`;
    }
    msg.reply(help);
}