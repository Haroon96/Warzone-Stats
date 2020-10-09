module.exports = {
    sendStats
};

const { getRecentMatches } = require('./cod-api');
const { generateEmbed, escapeMarkdown, formatDuration } = require('./util');

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
function sendStats(u, try_number, msgObj, duration, mode, err='') {    
    // returns a function that can be passed to setTimeout
    return async function() {
        // if retried max times, just stop
        if (try_number >= 10) {
            await msgObj.edit(`Failed to fetch stats for **${escapeMarkdown(u.username)}** (${u.platform}):\n> ${err.msg ? err.msg : err}`);
            return;
        }

        try {
            // try and send stats
            let matches = await getRecentMatches(u.platform, u.username, duration, mode);
            let stats = calculateStats(matches);
            let msg = generateEmbed(escapeMarkdown(u.username), stats, duration);
         
            // edit original message
            await msgObj.delete();
            await msgObj.channel.send(msg);
        } catch (e) {
            // an issue with the API, configure a retry and notify the user
            let errMsg = `Encountered the following issue while fetching stats ` + 
                `for **${escapeMarkdown(u.username)}** (${u.platform}).\n> ${e.msg ? e.msg : e}`;

            if (e.code != "WzMatchService::NoAccount") {
                // schedule retry
                setTimeout(sendStats(u, try_number + 1, msgObj, duration, mode, e), try_number * 5000);
                errMsg = `${errMsg}\n *Retry ${try_number + 1}/10*.`
            }

            // edit message with error
            await msgObj.edit(errMsg);
        }

    }
}
