import { Platform } from '../common/enums';

export type GameMode = 'br' | 'rmbl' | 'plndr';
export type DurationCode = 'h' | 'd' | 'w' | 'm';
export type DurationUnit = 'hour' | 'day' | 'week' | 'month';

export type Command = {
    method: Function;
    syntax: string;
    help: string;
    regex: RegExp;
};

export type Player = {
    username: string;
    platform: Platform;
    avatar: string;
};

export type MessageTokens = {
    command: string,
    args: Array<string>
};

export type Guild = {
    guildId: string,
    players: Array<Player>
};

export type Duration = {
    code: DurationCode,
    unit: DurationUnit,
    value: number
};

export type Stats = {
    'Matches': number,
    'Kills': number,
    'Deaths': number,
    'Time Played': string,
    'Avg. Game Time': string,
    'Avg. Team Placement': number,
    'Headshots': number,
    'Executions': number,
    'Vehicles Destroyed': number,
    'Team Wipes': number
};