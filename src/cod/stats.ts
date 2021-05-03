import { Duration, GameMode, Player, Stats } from "../common/types";
import { getRecentMatches } from "./api";
import { formatDuration, formatPlayername, getEmbedTemplate } from "../utilities/util";
import { Client, Message, MessageEmbed } from "discord.js";
import TaskRepeater from "../utilities/task-repeater";

export async function sendPlayerStats(message: Message, player: Player, duration: Duration, mode: GameMode) {

    const reply = await message.reply(getEmbedTemplate(`${formatPlayername(player, message.client)}`, "Fetching stats...", player.avatarUrl));

    try {
        // create a taskrepeater instance
        const taskRepeater = new TaskRepeater(fetchTask, [player, duration, mode], 5000, 5);

        // run the repeater
        let playerStats: Stats = await taskRepeater.run();

        // create a stats embed and send
        let embed = createStatsEmbed(player, playerStats, duration, message.client);
        await reply.edit(embed);
    } catch (e) {
        await reply.edit(getEmbedTemplate(`${formatPlayername(player, message.client)}`, "Failed to fetch stats.\n" + e))
    }
}

async function fetchTask(player: Player, duration: Duration, mode: GameMode) {
    let matches = await getRecentMatches(player, duration, mode);
    return calculateStats(matches);
}

function createStatsEmbed(player: Player, stats: Stats, duration: Duration, client: Client): MessageEmbed {
    let embed = getEmbedTemplate(`${formatPlayername(player, client)}`, `Stats for the past ${duration.value} ${duration.unit}(s)`, player.avatarUrl)

    // no matches played, early return
    if (stats['Matches'] == 0) {
        embed.setDescription(`No matches played over the past ${duration.value} ${duration.unit}(s)!`);
        return embed;
    }

    // proceed with formatting
    embed.setDescription(`over the past ${duration.value} ${duration.unit}(s)`)

    // add stats as embedded fields
    for (const stat in stats) {
        if (keepStat(stat, stats[stat])) {
            embed.addField(stat, stats[stat], true);
        }
    }
    
    return embed;
}

function keepStat(key, value) {
    // skip default stats
    if (['Matches', 'Kills', 'Deaths', 'K/D'].includes(key)) return false;
    // remove 0 value stats
    if (!value) return false;
    if (value == 0) return false;
    if (value == NaN) return false;
    if (value == "0.00") return false;
    if (value == "0s") return false;
    return true;
}

function sum(stats, field): number {
    try {
        // select field values
        let values = stats.map(x => x[field] ? x[field].value : 0);
        // sum all these values and return
        return values.reduce((a, b) => a + b, 0);
    } catch (e) {
        // something went wrong, possibly a change in the API
        console.error("Couldn't sum field", field);
        return NaN;
    }
}

function calculateStats(matches): Stats {
    let stats = matches.map(x => x.segments[0].stats);
    let statValues: Stats = {
        'Matches': stats.length,
        'Kills': sum(stats, 'kills'),
        'Deaths': sum(stats, 'deaths'),
        'Time Played': formatDuration(sum(stats, 'timePlayed')),
        'Avg. Game Time': formatDuration(sum(stats, 'timePlayed') / stats.length),
        'Avg. Team Placement': parseInt((sum(stats, 'teamPlacement') / Math.max(stats.length, 1)).toString()),
        'Headshots': sum(stats, 'headshots'),
        'Executions': sum(stats, 'executions'),
        'Vehicles Destroyed': sum(stats, 'objectiveDestroyedVehicleLight') + sum(stats, 'objectiveDestroyedVehicleMedium') + sum(stats, 'objectiveDestroyedVehicleHeavy'),
        'Team Wipes': sum(stats, 'objectiveTeamWiped')
    }

    statValues['K/D'] = statValues['Kills'] / Math.max(statValues['Deaths'], 1);
    statValues['K/D'] = statValues['K/D'].toFixed(2);

    return statValues;
}
