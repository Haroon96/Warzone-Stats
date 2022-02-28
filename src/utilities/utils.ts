import { Client, MessageEmbed } from "discord.js"
import { Duration, Player, Schedule } from "../common/types"
import { curly } from "node-libcurl"
import moment from 'moment'
import 'moment-duration-format'
import tls from 'tls';
import cronstrue from "cronstrue"

// Prepare tls
const tlsData = tls.rootCertificates.join('\n')

export function trimWhitespace(str: string): string {
    // remove extra, leading, and trailing whitespace
    return str.replace(/\s+/g, ' ').trim()
}

export function shuffle(arr: Array<any>) {
    arr.sort(_ => Math.random() - 0.5)
}

export function generateEmbed(title: string, desc: string, thumbnail: string = ''): MessageEmbed {
    return new MessageEmbed()
        .setColor('#2D3640')
        .setTitle(title)
        .setDescription(desc)
        .setThumbnail(thumbnail ? thumbnail + `?${parseInt(`${Math.random() * 10000}`)}` : '')
}

export async function request(url: string): Promise<any> {
    console.log(url)
    const response = await curly.get(url, { caInfoBlob: tlsData })
    return response.data
}

export function parseDuration(str: string | null, orElse: string = '24h'): Duration | null {
    const parsable = str ?? orElse

    const rx = /(?<num>[0-9]+)(?<code>[h|d|w|mo])/
    const groups = parsable.match(rx)?.groups

    if (!groups)
        return null

    const { num, code } = groups
    const value = parseInt(num)

    switch (code) {
        case 'h': return { value, code, unit: 'hour' }
        case 'd': return { value, code, unit: 'day' }
        case 'w': return { value, code, unit: 'week' }
        case 'm': return { value, code, unit: 'month' }
        default: throw 'Not reachable'
    }
}

export function formatDuration(seconds: number) {
    // @ts-ignore
    return moment.duration(seconds, 'seconds').format("w[w] d[d] h[h] m[m] s[s]", { trim: "both mid" })
}

export function formatSchedule(schedule: Schedule) {
    return `${cronstrue.toString(schedule.cron, { use24HourTimeFormat: true })}: Stats for the last ${schedule.duration.value} ${schedule.duration.unit}(s) on ${schedule.modeId} games`
}

export function formatPlayername(player: Player, client: Client | null = null) {

    let platformNames = { psn: "PlayStation", xbl: "Xbox", atvi: "Activision" }
    let { playerId, platformId } = player

    // remove unique id from playerId
    playerId = playerId.replace(/#.*/, '')

    // if we have access to the client, send platformId as emoji
    if (client) {
        // find the emoji in client emoji cache
        const platformEmoji = client.emojis.cache.find(e => e.name == `wz_${platformId}`)
        // if emoji found, return the string
        if (platformEmoji) {
            return `<:${platformEmoji.name}:${platformEmoji.id}> **${playerId}**`
        }
    }
    // else send platformId as text
    return `**${playerId}** *(${platformNames[platformId]})*`
}

export function sumStat(stats, field: string): number {
    try {
        // select field values
        let values = stats.map(x => x[field] ? x[field].value : 0)
        // sum all these values and return
        return values.reduce((a, b) => a + b, 0)
    } catch (e) {
        // something went wrong, possibly a change in the API
        console.error("Couldn't sum field", field)
        return NaN
    }
}