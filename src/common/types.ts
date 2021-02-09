import { Platform } from '../common/enums';

export type GameMode = 'br' | 'rmbl' | 'plndr';

export type Command = {
    method: Function;
    syntax: string;
    help: string;
    regex: RegExp;
}

export type Player = {
    username: string;
    platform: Platform;
    avatar: string;
}

export type MessageTokens = {
    command: string,
    args: Array<string>
}