import { MessageEmbed } from "discord.js";
import { Duration, DurationCode, DurationUnit, GameMode } from "../common/types";
import fetch from 'node-fetch';
import moment = require("moment");
require("moment-duration-format");

export function trimWhitespace(str: string): string {
    // remove extra, leading, and trailing whitespace
    return str.replace(/\s+/g, ' ').replace(/^\s*|\s*$/g, '');
}

export function getEmbedTemplate(title:string, desc: string, thumbnail: string=''): MessageEmbed {
    return new MessageEmbed()
        .setColor('#2D3640')
        .setAuthor('Warzone Stats', 'https://raw.githubusercontent.com/Haroon96/warzone-stats/gh-pages/img/favicon.png', 'https://haroon96.github.io/warzone-stats')
        .setTimestamp()
        .setTitle(title)
        .setDescription(desc)
        .setThumbnail(formatThumbnail(thumbnail));
}

export async function request(url: string): Promise<any> {
    let response = await fetch(url, {
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

    let rx = /([0-9]+)([h|d|w|mo])/;
    let match = str.match(rx);
    
    let value: number = parseInt(match[1]);
    let code: DurationCode, unit: DurationUnit;

    switch (match[2]) {
        case 'h':  code = 'h'; unit = 'hour'; break;
        case 'd':  code = 'd'; unit = 'day'; break;
        case 'w':  code = 'w'; unit = 'week'; break;
        case 'm':  code = 'm'; unit = 'month'; break;
    }

    return { value, code, unit };
}

export function parseGameMode(str: string): GameMode {
    if (str == "br") return "br";
    if (str == "rmbl") return "rmbl";
    if (str == "plndr") return "plndr";
    return null;
}

export function formatDuration(s) {
    // @ts-ignore
    return moment.duration(s, 'seconds').format("w[w] d[d] h[h] m[m] s[s]", {trim: "both mid"});
}


function formatThumbnail(thumbnail) {
    let th = thumbnail ? thumbnail + `?${randomInt()}` : '';
    console.log(th);
    return th;
}

function randomInt() {
    return parseInt(`${Math.random() * 10000}`);
}