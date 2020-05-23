module.exports = {
    sendStats: sendStats
};

const getRecentMatches = require('./cod-api').getRecentMatches;
const util = require('./util');
const { validateUser } = require('./validators');

const moment = require('moment');
// load moment-duration
require("moment-duration-format");


function aggregate(stats, field) {
    try {
        // select field values
        let values = stats.map(x => x[field] ? x[field].value : 0);
        // sum all these values and return
        return values.reduce((a, b) => a + b, 0);
    } catch (e) {
        // something went wrong, possibly a change in the API
        console.error("Couldn't aggregate field", field);
        return NaN;
    }
}

function calculateStats(matches) {
    let stats = matches.map(x => x.segments[0].stats);
    let statValues = {
        'Matches': stats.length,
        'Kills': aggregate(stats, 'kills'),
        'Deaths': aggregate(stats, 'deaths'),
        'Score': aggregate(stats, 'score'),
        'Time Played': moment.duration(aggregate(stats, 'timePlayed'), 'seconds').format("w[w] d[d] h[h] m[m] s[s]", {trim: "both mid"}),
        'Headshots': aggregate(stats, 'headshots'),
        'Assists': aggregate(stats, 'assists'),
        'Executions': aggregate(stats, 'executions'),
        'Vehicles Destroyed': aggregate(stats, 'objectiveDestroyedVehicleMedium'),
        'Team Wipes': aggregate(stats, 'objectiveTeamWiped'),
        'Total XP': aggregate(stats, 'totalXp')
    }
    statValues['K/D'] = statValues.Kills / statValues.Deaths;
    statValues['K/D'] = statValues['K/D'].toFixed(2);

    return statValues;
}

async function getStats(platform, username, duration) {
    let matches = await getRecentMatches(platform, username, duration);
    let stats = calculateStats(matches);
    return util.pprint(util.escapeMarkdown(username), stats, duration);
}

// timed-recursive function
function sendStats(u, tryn, msgObj, duration, err='') {
    // timeout durations for each retry
    let tryWaits = new Array(3).fill([5000, 10000, 30000, 60000, 90000]).flat().sort((a, b) => a - b);
    
    try {
        validateUser(u);
    } catch (err) {
        msgObj.edit(`Failed to fetch stats for **${util.escapeMarkdown(u.username)}** (${u.platform}):\n> ${err}`);
        return ()=>{};
    }

    // returns a function that can be passed to setTimeout
    return async function() {
        // if retried max times, just stop
        if (tryn >= tryWaits.length) {
            await msgObj.edit(`Failed to fetch stats for **${util.escapeMarkdown(u.username)}** (${u.platform}):\n> ${err}`);
            return;
        }

        try {
            // try and send stats
            let m = await getStats(u.platform, u.username, duration);

            // edit original message
            await msgObj.edit(m);
        } catch (e) {
            // an issue with the API, configure a retry and notify the user
            let errMsg = `Encountered the following issue while fetching stats ` + 
                `for **${util.escapeMarkdown(u.username)}** (${u.platform}).\n> ${e}\n *Retry ${tryn + 1}/${tryWaits.length}*.`;

            // edit message with error
            await msgObj.edit(errMsg);

            // edit original message
            setTimeout(sendStats(u, tryn + 1, msgObj, duration, e), tryWaits[tryn]);
        }

    }
}
