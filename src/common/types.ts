export type GameMode = 'br' | 'rmbl' | 'plndr' | 'rsg'
export type Platform = 'psn' | 'xbl' | 'atvi'

export type Player = {
    playerId: string
    platformId: Platform
    avatarUrl?: string
    active: boolean
}

export type Guild = {
    guildId: string,
    players: Array<Player>
    // active: Array<string>
}

export type Duration = {
    code: 'h' | 'd' | 'w' | 'm',
    unit: 'hour' | 'day' | 'week' | 'month',
    value: number
}

export type Command = {
    name: string,
    execute: Function,
    autocomplete: Function
    // command: SlashCommandBuilder
}

export type Stats = {
    'Matches': number,
    'K/D': string,
    'Avg. Lobby K/D': string
    'Assists': number,
    'Avg. Kills': string,
    'Avg. Deaths': string,
    'Time Played': string,
    'Time Waiting': string,
    'Avg. Game Time': string,
    'Headshots': number,
    // 'Executions': number,
    // 'Team Wipes': number,
    // 'Vehicles Destroyed': number,
    'Longest Streak': number,
    'High Kill Round': string,
    '1./2./3. Place': string,
    'Win Ratio': string,
    'Avg. Team Placement': string,
    'Avg. Damage done': number,
    'Avg. Damage taken': number,
    'Gulags': number,
    'Gulag Wins': string,
    'Gulag K/D': string,
    'Avg. Time per Kill': string,
    'Damage done / Kill': string,
    'Damage taken / Death': string
}

export type Schedule = {
    guildId: string,
    channelId: string,
    cron: string,
    duration: Duration,
    modeId: GameMode
}
