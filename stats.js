module.exports = {
    sendStats
};

const { getRecentMatches } = require('./cod-api');
const { generateStatsEmbed, formatDuration, generateEmbedTemplate } = require('./util');

function sum(stats, field) {
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

function calculateStats(matches) {
    let stats = matches.map(x => x.segments[0].stats);
    let statValues = {
        'Matches': stats.length,
        'Kills': sum(stats, 'kills'),
        'Deaths': sum(stats, 'deaths'),
        'Time Played': formatDuration(sum(stats, 'timePlayed')),
        'Avg. Game Time': formatDuration(sum(stats, 'timePlayed') / stats.length),
        'Avg. Team Placement': parseInt((sum(stats, 'teamPlacement') / Math.max(matches.length, 1))),
        'Headshots': sum(stats, 'headshots'),
        'Executions': sum(stats, 'executions'),
        'Vehicles Destroyed': sum(stats, 'objectiveDestroyedVehicleLight') + sum(stats, 'objectiveDestroyedVehicleMedium') + sum(stats, 'objectiveDestroyedVehicleHeavy'),
        'Team Wipes': sum(stats, 'objectiveTeamWiped')
    }

    statValues['K/D'] = statValues['Kills'] / Math.max(statValues['Deaths'], 1);
    statValues['K/D'] = statValues['K/D'].toFixed(2);

    return statValues;
}

// timed-recursive function
function sendStats(player, try_number, msgEmbed, duration, mode, err='') {    
    // returns a function that can be passed to setTimeout
    return async function() {
        // if retried max times, just stop
        if (try_number >= 10) {
            await msgEmbed.edit(generateEmbedTemplate(player).setDescription('Failed to fetch stats!').addField("Error", err.msg ? err.msg : err));
            return;
        }

        try {
            // try and send stats
            let matches = await getRecentMatches(player.platform, player.username, duration, mode);
            let stats = calculateStats(matches);
            let msg = generateStatsEmbed(player, stats, duration);
         
            // update original message
            await msgEmbed.edit(msg);
        } catch (e) {
            // an issue with the API, configure a retry and notify the user
            let embed = generateEmbedTemplate(player);
            embed.addField("Error", e.msg ? e.msg : e);

            if (e.code != "WzMatchService::NoAccount") {
                // schedule retry
                setTimeout(sendStats(player, try_number + 1, msgEmbed, duration, mode, e), (try_number + 1) * 5000);
                embed.addField("Retry", try_number + 1);
            }

            // edit message with error
            await msgEmbed.edit(embed);
        }

    }
}
