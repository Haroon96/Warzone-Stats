import { Duration, GameMode, Player, Stats, Lifetime } from "../common/types";
import { getRecentMatches, getDetailedPlayerProfile } from "./api";
import { formatDuration, formatPlayername, getEmbedTemplate } from "../utilities/util";
import { Client, Message, MessageEmbed } from "discord.js";
import TaskRepeater from "../utilities/task-repeater";

export async function sendPlayerStats(message: Message, player: Player, duration: Duration, mode: GameMode, lifetime: Lifetime) {

    const reply = await message.reply(getEmbedTemplate(`${formatPlayername(player, message.client)}`, "Fetching stats...", player.avatarUrl));

    try {
        // create a taskrepeater instance
        const taskRepeater = new TaskRepeater(fetchTask, [player, duration, mode, lifetime], 5000, 5);

        // run the repeater
        let playerStats: Stats = await taskRepeater.run();

        // create a stats embed and send
        let embed = createStatsEmbed(player, playerStats, duration, message.client, lifetime);
        await reply.edit(embed);
    } catch (e) {
        await reply.edit(getEmbedTemplate(`${formatPlayername(player, message.client)}`, "Failed to fetch stats.\n" + e.message));
    }
}

async function fetchTask(player: Player, duration: Duration, mode: GameMode, lifetime: Lifetime) {
    if (lifetime == null ) {
        let matches = await getRecentMatches(player, duration, mode);
        return calculateStats(matches);
    }
    else {
        let playerProfile = await getDetailedPlayerProfile(player);
        return calculateLifetimeStats(playerProfile, mode);
    }
}

function createStatsEmbed(player: Player, stats: Stats, duration: Duration, client: Client, lifetime: Lifetime): MessageEmbed {
    let embed = getEmbedTemplate(`${formatPlayername(player, client)}`, `Stats for the past ${duration.value} ${duration.unit}(s)`, player.avatarUrl)

    // no matches played, early return
    if (stats['Matches'] == 0) {
        embed.setDescription(`No matches played over the past ${duration.value} ${duration.unit}(s)!`);
        return embed;
    }

    // proceed with formatting
    if (lifetime == null)
        embed.setDescription(`over the past ${duration.value} ${duration.unit}(s)`)
    else
        embed.setDescription(`Lifetime stats`)

    // to get these stats on top 
    embed.addField('Matches', stats['Matches']);
    embed.addField('Kills', stats['Kills'], true);
    embed.addField('Deaths', stats['Deaths'], true);
    embed.addField('K/D', stats['K/D'], true);

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
        'Assists': sum(stats, 'assists'),
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

function calculateLifetimeStats(playerProfile, mode): Stats {
    if (mode == 'br')
        return calculateBrStats(playerProfile)
    else if (mode == 'plndr')
        return calculatePlndrStats(playerProfile)
    
}

function calculateBrStats(playerProfile): Stats {
    var JSSoup = require('jssoup').default;
    var soup = new JSSoup(playerProfile, false);
    var brHeader = soup.findAll(['h2']);
    
    // Find top Div for BR
    var div = brHeader[1].parent.parent.parent
    var spans = div.findAll(['span'])
    let statValues: Stats = {
        'Time Played': spans[0].contents[1]._text.replace(' Play Time', '').trim(),
        'Matches': spans[1].contents[0]._text.replace(' Matches', '').trim(),
        'Kills': spans[15].contents[0]._text,
        'Deaths': spans[18].contents[0]._text, 
        'Assists': null,
        'Avg. Game Time': null,
        'Avg. Team Placement': null,
        'Headshots': null,
        'Executions': null,
        'Vehicles Destroyed': null,
        'Team Wipes': null    
    }

    statValues['Wins'] = spans[3].contents[0]._text
    statValues['K/D'] = spans[21].contents[0]._text

    return statValues;
}

function calculatePlndrStats(playerProfile): Stats {
    var JSSoup = require('jssoup').default;
    var soup = new JSSoup(playerProfile, false);
    var plndrHeader = soup.findAll(['h2']);
    
    // Find top Div for Plunder
    var div = plndrHeader[2].parent.parent.parent
    var spans = div.findAll(['span'])
    let statValues: Stats = {
        'Time Played': spans[0].contents[1]._text.replace(' Play Time', '').trim(),
        'Matches': spans[1].contents[0]._text.replace(' Matches', '').trim(),
        'Kills': spans[5].contents[0]._text,
        'Deaths': spans[8].contents[0]._text, 
        'Assists': null,
        'Avg. Game Time': null,
        'Avg. Team Placement': null,
        'Headshots': null,
        'Executions': null,
        'Vehicles Destroyed': null,
        'Team Wipes': null    
    }

    statValues['Wins'] = spans[3].contents[0]._text
    statValues['K/D'] = spans[11].contents[0]._text

    return statValues;
}

