import { Client, MessageEmbed } from "discord.js";
import { CommandArgs, Duration, Player } from "../common/types";
import fetch from 'node-fetch';
import moment = require("moment");
require("moment-duration-format");

export function trimWhitespace(str: string): string {
    // remove extra, leading, and trailing whitespace
    return str.replace(/\s+/g, ' ').trim();
}

export function shuffle(arr: Array<any>) {
    arr.sort(_ => Math.random() - 0.5);
}

export function getEmbedTemplate(title:string, desc: string, thumbnail: string=''): MessageEmbed {
    return new MessageEmbed()
        .setColor('#2D3640')
        .setTitle(title)
        .setDescription(desc)
        .setThumbnail(formatThumbnail(thumbnail));
}

export async function request(url: string): Promise<any> {
    const response = await fetch(url, {
        credentials: "include",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en",
            "User-Agent": "haroon96/warzone-stats"
        },
        method: "GET",
        mode: "cors"
    });
    return await response.json();
}

export function parseDuration(str: string): Duration {
    if (!str) {
        return { value: 1, code: 'd', unit: 'day' };
    }

    const rx = /(?<num>[0-9]+)(?<code>[h|d|w|mo])/;
    const match = str.match(rx);

    const { num, code } = match.groups;
    const value = parseInt(num);
    
    switch (code) {
        case 'h':  return { value, code, unit: 'hour' };
        case 'd':  return { value, code, unit: 'day' };
        case 'w':  return { value, code, unit: 'week' };
        case 'm':  return { value, code, unit: 'month' };
    }
}

export function parseArgs(args): CommandArgs {
    
    if (!args) args = {};
    
    const parsedArgs: CommandArgs = {
        platformId: args.platformId ?? null,
        playerId: args.playerId ?? null,
        modeId: args.modeId ?? null,
        cron: args.cron ?? null,
        duration: args.duration ? parseDuration(args.duration) : null,
        teamSize: args.teamSize ? parseInt(args.teamSize) : null
    };

    return parsedArgs;
}

export function formatDuration(s: number) {
    // @ts-ignore
    return moment.duration(s, 'seconds').format("w[w] d[d] h[h] m[m] s[s]", {trim: "both mid"});
}

export function formatPlayername(player: Player, client: Client = null) {
    // if we have access to the client, send platform emoji
    if (client) {
        const emojiName = `wz_${player.platformId}`;
        const platformEmoji = client.emojis.cache.find(e => e.name == emojiName);
        if (platformEmoji) {
            return `<:${platformEmoji.name}:${platformEmoji.id}> **${player.playerId}**`;
        }
    }
    // else send platform text
    return `**${player.playerId}** *(${player.platformId})*`
}

function formatThumbnail(thumbnail: string) {
    return thumbnail ? thumbnail + `?${randomInt()}` : '';
}

function randomInt() {
    return parseInt(`${Math.random() * 10000}`);
}