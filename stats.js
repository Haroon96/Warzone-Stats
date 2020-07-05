module.exports = {
    sendStats
};

const { getRecentMatches } = require('./cod-api');
const { pprint, escapeMarkdown, formatDuration } = require('./util');

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
        'Kills': sum(stats, 'kills') - sum(stats, 'gulagKills'),
        'Deaths': sum(stats, 'deaths') - sum(stats, 'gulagDeaths'),
        'Gulag Kills': sum(stats, 'gulagKills'),
        'Gulag Deaths': sum(stats, 'gulagDeaths'),
        'Time Played': formatDuration(sum(stats, 'timePlayed')),
        'Avg. Game Time': formatDuration(sum(stats, 'timePlayed') / stats.length),
        'Headshots': sum(stats, 'headshots'),
        'Executions': sum(stats, 'executions'),
        'Vehicles Destroyed': sum(stats, 'objectiveDestroyedVehicleMedium'),
        'Team Wipes': sum(stats, 'objectiveTeamWiped')
    }

    statValues['K/D (match)'] = statValues.Kills / Math.max(statValues.Deaths, 1);
    statValues['K/D (match)'] = statValues['K/D (match)'].toFixed(2);

    statValues['K/D (gulag)'] = statValues['Gulag Kills'] / Math.max(statValues['Gulag Deaths'], 1);
    statValues['K/D (gulag)'] = statValues['K/D (gulag)'].toFixed(2);

    return statValues;
}

// timed-recursive function
function sendStats(u, tryn, msgObj, duration, err='') {
    // timeout durations for each retry
    let tryWaits = new Array(3).fill([5000, 10000, 30000, 60000, 90000]).flat().sort((a, b) => a - b);
    
    // returns a function that can be passed to setTimeout
    return async function() {
        // if retried max times, just stop
        if (tryn >= tryWaits.length) {
            await msgObj.edit(`Failed to fetch stats for **${escapeMarkdown(u.username)}** (${u.platform}):\n> ${err.msg}`);
            return;
        }

        try {
            // try and send stats
            let matches = await getRecentMatches(u.platform, u.username, duration);
            let stats = calculateStats(matches);
            let msg = pprint(escapeMarkdown(u.username), stats, duration);
         
            // edit original message
            await msgObj.edit(msg);
        } catch (e) {
            // an issue with the API, configure a retry and notify the user
            let errMsg = `Encountered the following issue while fetching stats ` + 
                `for **${escapeMarkdown(u.username)}** (${u.platform}).\n> ${e.msg}\n *Retry ${tryn + 1}/${tryWaits.length}*.`;

            if(e.code == "WzMatchService::NoAccount") {
                //truncate the retry part and the /n
                errMsg = errMsg.slice(0, errMsg.indexOf("*Retry") - 1);
            } else {
                // schedule retry
                setTimeout(sendStats(u, tryn + 1, msgObj, duration, e), tryWaits[tryn]);
            }
            // edit message with error
            await msgObj.edit(errMsg);
        }

    }
}
