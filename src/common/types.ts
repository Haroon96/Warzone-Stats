export type GameMode = 'br' | 'rmbl' | 'plndr' | 'rsg';
export type Platform = 'psn' | 'xbl' | 'atvi';

export type Player = {
    playerId: string;
    platformId: Platform;
    avatarUrl?: string;
};

export type Guild = {
    guildId: string,
    players: Array<Player>
};

export type Duration = {
    code: 'h' | 'd' | 'w' | 'm',
    unit: 'hour' | 'day' | 'week' | 'month',
    value: number
};

export type Command = {
    method: Function;
    usage: string;
    help: string;
    regex: Array<RegExp>;
};

export type CommandArgs = {
    modeId: GameMode,
    playerId: string,
    platformId: Platform,
    duration: Duration,
    cron: string,
    teamSize: number
};

export type Stats = {
    'Matches': number,
    'Kills': number,
    'Deaths': number,
    'Assists': number,
    'Time Played': string,
    'Avg. Game Time': string,
    'Headshots': number,
    'Executions': number,
    'Vehicles Destroyed': number,
    'Team Wipes': number,
    'Longest Streak': number,
    'Wins': number
};

export type Schedule = {
    channelId: string,
    cron: string,
    duration: Duration,
    modeId: GameMode
}
