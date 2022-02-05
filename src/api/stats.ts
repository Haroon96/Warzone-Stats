import { Duration, GameMode, Player, Stats } from "../common/types.js"
import { getRecentMatches } from "./trackergg_api.js"
import { formatDuration, formatPlayername, generateEmbed, sumStat } from "../utilities/utils.js"
import { Client, CommandInteraction, MessageEmbed } from "discord.js"
import TaskRepeater from "../utilities/task-repeater.js"
import moment from "moment"

export async function sendPlayerStats(interaction: CommandInteraction, players: Player[], duration: Duration, modeId: GameMode) {

    // Generate initial embeds showing acitivity
    var embeds = new Map(players.map(p =>
        [p.playerId, generateEmbed(`${formatPlayername(p, interaction.client)}`, "Fetching stats...", p.avatarUrl)]
    ))

    await interaction.reply({ embeds: [...embeds.values()] })

    players.forEach(async player => {
        try {
            // `onError` callback is called after each failed attempt
            const onError = (e, retryNum, totalRetries) => {
                embeds.get(player.playerId).setDescription(`Failed to fetch stats!\n${e.message}\nRetry ${retryNum} of ${totalRetries}`)
                interaction.editReply({ embeds: [...embeds.values()] })
            }

            // create a `TaskRepeater` instance
            const taskRepeater = new TaskRepeater(fetchTask, [player, duration, modeId], 5000, 5, onError)

            // run the repeater
            let playerStats: Stats = await taskRepeater.run()

            // create a stats embed and send
            embeds.set(player.playerId, generateStatsEmbed(player, playerStats, duration, interaction.client))
            await interaction.editReply({ embeds: [...embeds.values()] })
        } catch (e) {
            console.error(e)
            embeds.get(player.playerId).setDescription("Failed to fetch stats.\n")
            interaction.editReply({ embeds: [...embeds.values()] })
        }
    })
}

async function fetchTask(player: Player, duration: Duration, modeId: GameMode) {
    let matches = await getRecentMatches(player, duration, modeId)
    return calculateStats(matches)
}

function generateStatsEmbed(player: Player, stats: Stats, duration: Duration, client: Client): MessageEmbed {
    let embed = generateEmbed(`${formatPlayername(player, client)}`, `Stats for the past ${duration.value} ${duration.unit}(s)`, player.avatarUrl)

    // no matches played, early return
    if (stats['Matches'] == 0) {
        embed.setDescription(`No matches played over the past ${duration.value} ${duration.unit}(s)!`)
        return embed
    }

    // proceed with formatting
    embed.setDescription(`over the past ${duration.value} ${duration.unit}(s)`)

    // to get matches on top 
    embed.addField('Matches', stats.Matches.toString())

    // add stats as embedded fields
    for (const stat in stats) {
        if (filterStats(stat, stats[stat])) {
            embed.addField(stat, '' + stats[stat], true)
        }
    }

    return embed
}

function filterStats(key, value) {
    // skip default stats
    if (['Matches', 'Kills', 'Deaths', 'K/D'].includes(key)) return false

    // skip some unimportant stats
    if (['Executions', 'Vehicles Destroyed'].includes(key)) return false

    if (value === undefined || value === NaN) return false
    // if (value == 0) return false
    // if (value == "0.00") return false
    // if (value == "0s") return false
    return true
}

function calculateStats(matches): Stats {
    const stats = matches.map(x => x.segments[0].stats)

    const kills = sumStat(stats, 'kills')
    const deaths = sumStat(stats, 'deaths')
    const assists = sumStat(stats, 'assists')
    const timePlayed = sumStat(stats, 'timePlayed')
    const gulagKills = sumStat(stats, 'gulagKills')
    const gulagDeaths = stats.reduce((count, match) => match['gulagDeaths'].value > 0 ? count + 1 : count, 0)
    const damageDone = sumStat(stats, 'damageDone')
    const damageTaken = sumStat(stats, 'damageTaken')

    const kd = kills / Math.max(deaths, 1)

    const lobbyKdMatches = matches.map(x => x.attributes.avgKd).filter(x => x)
    const lobbyKd = lobbyKdMatches.reduce((total, x) => total + x.kd, 0) / lobbyKdMatches.length

    var timeWaiting = 0
    if (matches.length > 1) {
        const timestamps = matches
            .map(m => ({ timestamp: moment(m.metadata.timestamp), duration: moment.duration(m.segments[0].stats.timePlayed.value, 's') }))
            .sort((a, b) => a.timestamp.diff(b.timestamp))

        for (var i = 1; i < timestamps.length; i++) {
            const previousEnd: moment.Moment = timestamps[i - 1].timestamp.add(timestamps[i - 1].duration)
            const currentBegin: moment.Moment = timestamps[i].timestamp
            const waiting = currentBegin.diff(previousEnd, 'seconds')

            // Filter waiting times > 15 minutes
            if (waiting < 900) {
                timeWaiting += waiting
            }
        }
    }

    const placementHistogram = stats.reduce((hist, match) => {
        hist[match.teamPlacement.value] ? hist[match.teamPlacement.value]++ : hist[match.teamPlacement.value] = 1
        return hist
    }, {})

    //calculate win percentage
    const winRatio = (100 * (placementHistogram[1] ?? 0) / matches.length)

    //calculate placement percentile
    const matchesTotalTeams = matches.map(x => x.metadata.teamCount)
    const matchesPlacements = stats.map(x => x.placement.value)

    var placementPercentile = 0
    if (matchesTotalTeams.length == matchesPlacements.length) {
        placementPercentile = 100 * (matchesPlacements.map((x, i) => x / matchesTotalTeams[i]).reduce((x, y) => x + y, 0)) / matches.length
    }

    //calculate damage per kill/death
    const dmgPerKill = damageDone / kills
    const dmgPerDeath = damageTaken / deaths

    const statValues: Stats = {
        'Matches': stats.length,
        'K/D': `${kills}/${deaths} (${kd.toFixed(2)})`,
        'Avg. Lobby K/D': lobbyKd.toFixed(2),
        'Assists': assists,
        'Avg. Kills': (kills / stats.length).toFixed(2),
        'Avg. Deaths': (deaths / stats.length).toFixed(2),
        'Headshots': sumStat(stats, 'headshots'),
        'Time Played': formatDuration(timePlayed),
        'Time Waiting': formatDuration(timeWaiting),
        'Avg. Game Time': formatDuration(timePlayed / stats.length),
        'Executions': sumStat(stats, 'executions'),
        'Vehicles Destroyed': sumStat(stats, 'objectiveDestroyedVehicleLight') + sumStat(stats, 'objectiveDestroyedVehicleMedium') + sumStat(stats, 'objectiveDestroyedVehicleHeavy'),
        // 'Team Wipes': sumStat(stats, 'objectiveTeamWiped'),
        '1./2./3. Place': (placementHistogram[1] ?? 0) + "/" + (placementHistogram[2] ?? 0) + "/" + (placementHistogram[3] ?? 0),
        'Win Ratio': winRatio.toFixed(0) + '%',
        'Avg. Team Placement': 'Top ' + placementPercentile.toFixed(1) + '%',
        'Longest Streak': Math.max(...stats.map(x => x.longestStreak ? x.longestStreak.value : 0)),
        'Damage done / Kill': dmgPerKill.toFixed(0),
        'Damage taken / Death': dmgPerDeath.toFixed(0),
        'Avg. Damage done': Math.floor(damageDone / stats.length),
        'Avg. Damage taken': Math.floor(damageTaken / stats.length),
        'Avg. Time per Kill': (timePlayed / kills / 60).toFixed(2) + ' min',
        'Gulags': gulagKills + gulagDeaths,
        'Gulag Wins': gulagKills + ' (' + (gulagKills / (gulagKills + gulagDeaths) * 100).toFixed(0) + '%)',
        'Gulag K/D': (gulagKills / gulagDeaths).toFixed(2),
    }

    return statValues
}
