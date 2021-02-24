import { Message } from "discord.js";
import * as commands from './commands';
import { Command } from '../common/types';
import { trimWhitespace } from "../utilities/util";
import { CLIENT_RENEG_WINDOW } from "tls";

export default async function(message: Message) {

    // sanitize the message body
    message.content = trimWhitespace(message.content).toLowerCase();

    // extract commandName from message
    let commandName = message.content.split(' ')[1];

    // fetch the command from commandMap
    let command = commandMap.get(commandName);

    // if command not found, post help and return
    if (!command) {
        commands.postHelp(message);
        return;
    }
    
    // check if command regex matches
    for (let regex of command.regex) {
        if (regex.test(message.content)) {
            let { groups } = message.content.match(regex);
            await command.method(message, groups);
            return;
        }
    }

    // command syntax was incorrect, post command syntax
    message.reply(`Invalid usage of command! See example usage below.\n${command.usage.join('\n')}`);
}

const commandMap = new Map<string, Command>([
    ['stats', {
        method: commands.postStats,
        usage: [
            'For stats of all registered users: `!wz stats <mode> [time]`',
            'For stats of a specific user: `!wz stats <mode> <platform> "<playerId>" [time]`',
            '*Modes*: `br` for Battle Royale, `pldnr` for Plunder, `rmbl` for Rumble',
            '*Platform*: `psn` for PlayStation Network, `xbl` for Xbox Live, `atvi` for Activision ID',
            '*Time*: `8h` for 8 hours, `1d` for 1 day, `2w` for two weeks, `1m` for 1 month'
        ],
        help: 'Display stats of all registered users',
        regex: [
            /^!wz stats (?<mode>br|rmbl|plndr)$/,
            /^!wz stats (?<mode>br|rmbl|plndr) (?<duration>[0-9]+[h|d|w|m])$/,
            /^!wz stats (?<mode>br|rmbl|plndr) (?<platform>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+)$/,
            /^!wz stats (?<mode>br|rmbl|plndr) (?<platform>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+) (?<duration>[0-9]+[h|d|w|m])$/,
            /^!wz stats (?<mode>br|rmbl|plndr) (?<platform>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)"$/,
            /^!wz stats (?<mode>br|rmbl|plndr) (?<platform>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)" (?<duration>[0-9]+[h|d|w|m])$/,
        ]
    }],
    ['users', {
        method: commands.postUsers,
        usage: ['users'],
        help: 'Prints list of all registered users',
        regex: [/^!wz users$/]
    }],
    ['register', {
        method: commands.registerUser,
        usage: ['register <psn|xbl|atvi> "<playerId>"' ],
        help: 'Registers a new user',
        regex: [
            /^!wz register (?<platform>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+)$/,
            /^!wz register (?<platform>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)"$/,
        ]
    }],
    ['unregister', {
        method: commands.unregisterUser, 
        usage: ['unregister <psn|xbl|atvi> "<playerId>"'], 
        help: 'Unregisters a user',
        regex: [
            /^!wz unregister (?<platform>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+)$/,
            /^!wz unregister (?<platform>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)"$/,
        ] 
    }],
    ['schedule', {
        method: commands.scheduleStats,
        usage: ['schedule "<cronjob>" <br|rmbl|plndr> [time:3h|3d|1w|2m:1d]' ],
        help: 'Schedule automated stats posting at set times',
        regex: [
            /^!wz schedule "([*\//0-9- ]+)" (?<mode>br|rmbl|plndr)$/,
            /^!wz schedule "([*\//0-9- ]+)" (?<mode>br|rmbl|plndr) (?<duration>[0-9]+[h|d|w|m])$/
        ]
    }],
    ['unschedule', {
        method: commands.unscheduleStats,
        usage: ['unschedule' ],
        help: 'Unschedule automated stats posting',
        regex: [/^!wz unschedule$/]
    }],
    ['help', {
        method: commands.postHelp,
        usage: ['help' ],
        help: 'Shows this help',
        regex: [/^!wz help$/]
    }],
    ['teams', {
        method: commands.postTeamSplit,
        usage: ['teams <players-per-team>' ],
        help: 'Randomly splits registed users into teams',
        regex: [/^!wz teams [0-9]+$/]
    }]
]);



