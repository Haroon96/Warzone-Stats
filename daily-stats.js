module.exports = {
    getDailyStats: getDailyStats
};

const codApi = require('./cod-api');
const moment = require('moment');

function calculateStats(matches) {
    let stats = matches.map(x => x.segments[0].stats);
    let sum = (a, b) => a + b;
    let statValues = {
        matches: stats.length,
        kills: stats.map(x => x.kills.value).reduce(sum),
        deaths: stats.map(x => x.deaths.value).reduce(sum)
    }
    statValues.kdratio = statValues.kills / statValues.deaths;
    statValues.kdratio = statValues.kdratio.toFixed(2);

    return statValues;
}

function prettify(username, stats) {
    return `> Stats for **${username}** on ${moment().format('DD MMM, YYYY')}\n` + 
        `> Matches: \`${stats.matches}\`\n` + 
        `> Kills: \`${stats.kills}\`\n` + 
        `> Deaths: \`${stats.deaths}\`\n` + 
        `> K/D Ratio: \`${stats.kdratio}\`\n`;
}

async function getDailyStats(platform, username) {
    try {
        let matches = await codApi.getTodaysMatches(platform, username);
        let stats = calculateStats(matches);
        return prettify(username, stats);
    } catch(e) {
        console.error(e);
        throw 'Invalid platform/username!';
    }
}
