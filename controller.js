module.exports = controller;

const db = require('./db');
const stats = require('./stats');
const util = require('./util');

const commands = {
    'stats': { 
        method: allStats, 
        syntax: 'stats', 
        help: 'Display stats of all users',
        rx: /!cds stats/
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
    'mine': { 
        method: meStats, 
        syntax: 'mine <psn|atvi> <username>', 
        help: 'Display solo stats',
        rx: /!cds mine (psn|atvi) [0-9A-Za-z#_]+/
    },
    'help': {
        method: help,
        syntax: 'help',
        help: 'Shows this help',
        rx: /!cds help/
    }
};

async function controller(msg) {
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
            let pStats = await stats.getDailyStats(u.platform, u.username);
            replies.push(util.pprint(util.escapeMarkdown(pStats.username), pStats.stats));
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
            errors.map(x => `${x.username} (${x.platform}): \`${x.error}\``).join('\n'));
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

async function meStats(msg) {
    let tokens = util.tokenize(msg.content);
    let pStats = await stats.getDailyStats(tokens[2], tokens[3]);
    msg.reply('\n' + util.pprint(util.escapeMarkdown(pStats.username), pStats.stats));
}

async function help(msg) {
    let help = '\n**COD-Daily-Stats Guide:**\n';
    for (let cmd in commands) {
        help += `\`${commands[cmd].syntax}\`: *${commands[cmd].help}*\n`;
    }
    msg.reply(help);
}