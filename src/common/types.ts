export type GameMode = 'br' | 'rmbl' | 'plndr';
export type Platform = 'psn' | 'xbl' | 'atvi';
export type DurationCode = 'h' | 'd' | 'w' | 'm';
export type DurationUnit = 'hour' | 'day' | 'week' | 'month';

export type Command = {
    method: Function;
    usage: string;
    help: string;
    regex: Array<RegExp>;
};

export type Player = {
    playerId: string;
    platformId: Platform;
    avatarUrl: string;
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

export type Schedule = {
    channelId: string,
    cron: string,
    time: string,
    modeId: GameMode
}