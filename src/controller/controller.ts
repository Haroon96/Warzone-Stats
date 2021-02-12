import { Message } from "discord.js";
import * as commands from './commands';
import { Command, MessageTokens } from '../common/types';
import { trimWhitespace } from "../utilities/util";

export default async function(message: Message) {

    // sanitize the message body
    message.content = trimWhitespace(message.content).toLowerCase();

    // extract tokens from message
    let tokens = tokenizeMessage(message.content);

    // fetch the command from commandMap
    let command = commandMap.get(tokens.command);

    // if command not found, post help and return
    if (!command) {
        commands.postHelp(message);
        return;
    }
    
    // if invalid syntax, post command syntax and return
    if (!command.regex.test(message.content)) {
        // send invalid syntax reply
        return;
    }

    // forward message to corresponding method
    await command.method(message, tokens.args);
}


export function tokenizeMessage(str: string): MessageTokens {
    let tokens = str.toLowerCase().split(' ');
    
    return {
        command: tokens[1],
        args: tokens.slice(2)
    }
}

const commandMap = new Map<string, Command>([
    ['stats', {
        method: commands.postStats,
        syntax: 'stats <br|rmbl|plndr> [time:3h|3d|1w|2m:1d]',
        help: 'Display stats of all registered users',
        regex: /^!wz stats (br|rmbl|plndr)( ([0-9]+)([h|d|w|m]))?$/
    }],
    ['users', {
        method: commands.postUsers,
        syntax: 'users',
        help: 'Prints list of all registered users',
        regex: /^!wz users$/
    }],
    ['register', {
        method: commands.registerUser,
        syntax: 'register <psn|xbl|atvi> "<username>"',
        help: 'Registers a new user',
        regex: /^!wz register (psn|xbl|atvi) ([0-9A-Za-z#_\-]+|"[0-9A-Za-z#_\- ]+")$/
    }],
    ['unregister', {
        method: commands.unregisterUser, 
        syntax: 'unregister <psn|xbl|atvi> "<username>"', 
        help: 'Unregisters a user',
        regex: /^!wz unregister (psn|xbl|atvi) ([0-9A-Za-z#_\-]+|"[0-9A-Za-z#_\- ]+")$/ 
    }],
    ['single', {
        method: commands.postSingleStats, 
        syntax: 'single <br|rmbl|plndr> <psn|xbl|atvi> "<username>" [time:3h|3d|1w|2m:1d]',
        help: 'Display solo stats',
        regex: /^!wz single (br|rmbl|plndr) (psn|xbl|atvi) ([0-9A-Za-z#_\-]+|"[0-9A-Za-z#_\- ]+")( ([0-9]+)([h|d|w|m]))?$/
    }],
    ['schedule', {
        method: commands.scheduleStats,
        syntax: 'schedule "<cronjob>" <br|rmbl|plndr> [time:3h|3d|1w|2m:1d]',
        help: 'Schedule automated stats posting at set times',
        regex: /^!wz schedule "([*\//0-9- ]+)" (br|rmbl|plndr)( ([0-9]+)([h|d|w|m]))?$/
    }],
    ['unschedule', {
        method: commands.unscheduleStats,
        syntax: 'unschedule',
        help: 'Unschedule automated stats posting',
        regex: /^!wz unschedule$/
    }],
    ['help', {
        method: commands.postHelp,
        syntax: 'help',
        help: 'Shows this help',
        regex: /^!wz help$/
    }],
    ['teams', {
        method: commands.postTeamSplit,
        syntax: 'teams <players-per-team>',
        help: 'Randomly splits registed users into teams',
        regex: /^!wz teams [0-9]+$/
    }]
]);



