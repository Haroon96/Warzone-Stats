import { Command } from '../common/types';
import * as commands from './commands';

export default new Map<string, Command>([
    ['stats', {
        method: commands.postStats,
        usage: '!wz stats <modeId> [platformId] [playerId] [duration]',
        help: 'Display stats of a single player or all registered players',
        regex: [
            /^!wz stats (?<modeId>br|rmbl|plndr)$/,
            /^!wz stats (?<modeId>br|rmbl|plndr) (?<duration>[0-9]+[h|d|w|m])$/,
            /^!wz stats (?<modeId>br|rmbl|plndr) (?<platformId>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+)$/,
            /^!wz stats (?<modeId>br|rmbl|plndr) (?<platformId>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+) (?<duration>[0-9]+[h|d|w|m])$/,
            /^!wz stats (?<modeId>br|rmbl|plndr) (?<platformId>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)"$/,
            /^!wz stats (?<modeId>br|rmbl|plndr) (?<platformId>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)" (?<duration>[0-9]+[h|d|w|m])$/,
        ]
    }],
    ['players', {
        method: commands.postPlayers,
        usage: '!wz players',
        help: 'Show all registered players',
        regex: [/^!wz players$/]
    }],
    ['register', {
        method: commands.registerPlayer,
        usage: '!wz register <platformId> "<playerId>"' ,
        help: 'Register a new player',
        regex: [
            /^!wz register (?<platformId>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+)$/,
            /^!wz register (?<platformId>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)"$/,
        ]
    }],
    ['unregister', {
        method: commands.unregisterPlayer, 
        usage: '!wz unregister <platformId> "<playerId>"', 
        help: 'Unregister a player',
        regex: [
            /^!wz unregister (?<platformId>psn|xbl|atvi) (?<playerId>[0-9A-Za-z#_\-]+)$/,
            /^!wz unregister (?<platformId>psn|xbl|atvi) "(?<playerId>[0-9A-Za-z#_\- ]+)"$/,
        ] 
    }],
    ['schedule', {
        method: commands.scheduleStats,
        usage: '!wz schedule "<cronjob>" <modeId> [time]',
        help: 'Schedule automated stats posting',
        regex: [
            /^!wz schedule "([*\//0-9- ]+)" (?<modeId>br|rmbl|plndr)$/,
            /^!wz schedule "([*\//0-9- ]+)" (?<modeId>br|rmbl|plndr) (?<duration>[0-9]+[h|d|w|m])$/
        ]
    }],
    ['unschedule', {
        method: commands.unscheduleStats,
        usage: '!wz unschedule',
        help: 'Unschedule automated stats posting',
        regex: [/^!wz unschedule$/]
    }],
    ['teams', {
        method: commands.postTeamSplit,
        usage: '!wz teams <teamSize>' ,
        help: 'Randomly split registered players into teams',
        regex: [/^!wz teams [0-9]+$/]
    }]
]);



