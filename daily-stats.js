module.exports = {
    getDailyStats: getDailyStats
};

const codApi = require('./cod-api');
const moment = require('moment');

function calculateStats(matches) {
    let stats = matches.map(x => x.segments[0].stats);
    let sum = (a, b) => a + b;
    let statValues = {
        'Matches': stats.length,
        'Kills': stats.map(x => x.kills.value).reduce(sum),
        'Deaths': stats.map(x => x.deaths.value).reduce(sum),
        'Score': stats.map(x => x.score.value).reduce(sum),
        'Time Played': moment.utc(stats.map(x => x.timePlayed.value).reduce(sum) * 1000).format('HH:mm:ss'),
        'Headshots': stats.map(x => x.headshots.value).reduce(sum),
        'Assists': stats.map(x => x.assists.value).reduce(sum),
        'Executions': stats.map(x => x.executions.value).reduce(sum),
        'Vehicles Destroyed': stats.map(x => x.objectiveDestroyedVehicleMedium ? x.objectiveDestroyedVehicleMedium.value : 0).reduce(sum),
        'Team Wipes': stats.map(x => x.objectiveTeamWiped ? x.objectiveTeamWiped.value : 0).reduce(sum),
        'Total XP': stats.map(x => x.totalXp.value).reduce(sum)
    }
    statValues['K/D'] = statValues.Kills / statValues.Deaths;
    statValues['K/D'] = statValues['K/D'].toFixed(2);

    return {
        username: matches[0].segments[0].metadata.platformUserHandle,
        stats: statValues,
    }
}

async function getDailyStats(platform, username) {
    let matches = await codApi.getTodaysMatches(platform, username);
    return calculateStats(matches);
}
