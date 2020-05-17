module.exports = {
    getStats: getStats
};

const getRecentMatches = require('./cod-api').getRecentMatches;
const moment = require('moment');
// load moment-duration
require("moment-duration-format");

function calculateStats(matches) {
    let stats = matches.map(x => x.segments[0].stats);
    let sum = (a, b) => a + b;
    let statValues = {
        'Matches': stats.length,
        'Kills': stats.map(x => x.kills.value).reduce(sum, 0),
        'Deaths': stats.map(x => x.deaths.value).reduce(sum, 0),
        'Score': stats.map(x => x.score.value).reduce(sum, 0),
        'Time Played': moment.duration(stats.map(x => x.timePlayed.value).reduce(sum, 0), 'seconds').format("w[w] d[d] h[h] m[m] s[s]", {trim: "both mid"}),
        'Headshots': stats.map(x => x.headshots.value).reduce(sum, 0),
        'Assists': stats.map(x => x.assists.value).reduce(sum, 0),
        'Executions': stats.map(x => x.executions.value).reduce(sum, 0),
        'Vehicles Destroyed': stats.map(x => x.objectiveDestroyedVehicleMedium ? x.objectiveDestroyedVehicleMedium.value : 0).reduce(sum, 0),
        'Team Wipes': stats.map(x => x.objectiveTeamWiped ? x.objectiveTeamWiped.value : 0).reduce(sum, 0),
        'Total XP': stats.map(x => x.totalXp.value).reduce(sum, 0)
    }
    statValues['K/D'] = statValues.Kills / statValues.Deaths;
    statValues['K/D'] = statValues['K/D'].toFixed(2);

    return statValues;
}

async function getStats(platform, username, duration) {
    let matches = await getRecentMatches(platform, username, duration);
    return calculateStats(matches);
}
