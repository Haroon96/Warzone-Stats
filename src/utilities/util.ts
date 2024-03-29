import { Client, MessageEmbed } from "discord.js";
import { CommandArgs, Duration, Player } from "../common/types";
import moment from 'moment';
import 'moment-duration-format';
import webdriver, { By } from "selenium-webdriver";
import * as firefox from 'selenium-webdriver/firefox.js'
import promiseList from "promise-limit";

const limit = promiseList(1);

const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options().headless())
    .build();

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
    return limit(async() => {
        await driver.get('view-source:' + url);
        const el = await driver.findElement(By.tagName('pre'));
        const response = JSON.parse(await el.getText());
        return response;
    });
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
        duration: args.duration ? parseDuration(args.duration) : parseDuration('24h'),
        teamSize: args.teamSize ? parseInt(args.teamSize) : null
    };

    return parsedArgs;
}

export function formatDuration(s: number) {
    // @ts-ignore
    return moment.duration(s, 'seconds').format("w[w] d[d] h[h] m[m] s[s]", {trim: "both mid"});
}

export function formatPlayername(player: Player, client: Client = null) {

    let platformNames = { "psn" : "PlayStation" , "xbl" : "Xbox" , "battlenet" : "Battlenet"};
    let { playerId, platformId } = player;
    
    // remove unique id from playerId
    playerId = playerId.replace(/#.*/, '');

    // if we have access to the client, send platformId as emoji
    if (client) {
        // find the emoji in client emoji cache
        const platformEmoji = client.emojis.cache.find(e => e.name == `wz_${platformId}`);
        // if emoji found, return the string
        if (platformEmoji) {
            return `<:${platformEmoji.name}:${platformEmoji.id}> **${playerId}**`;
        }
    }
    // else send platformId as text
    return `**${playerId}** *(${platformNames[platformId]})*`
}

function formatThumbnail(thumbnail: string) {
    return thumbnail ? thumbnail + `?${randomInt()}` : '';
}

function randomInt() {
    return parseInt(`${Math.random() * 10000}`);
}
