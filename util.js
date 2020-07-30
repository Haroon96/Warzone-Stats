module.exports = {
    tokenize,
    pprint,
    escapeMarkdown,
    parseDuration,
    isValidCron: require('cron-validator').isValidCron,
    shuffle,
    formatDuration
};

const moment = require('moment');
// load moment-duration
require("moment-duration-format");

function tokenize(msg) {
    return msg.toLowerCase().split(/ +/);
}

function keepStat(key, value) {
    // always display these stats
    if (['Match Kills', 'Match Deaths', 'K/D (match)'].includes(key)) return true;
    // remove 0 value stats
    if (!value) return false;
    if (value == 0) return false;
    if (value == NaN) return false;
    if (value == "0.00") return false;
    if (value == "0s") return false;
    return true;
}

function pprint(username, stats, duration) {
    let msg = [`Stats for **${username}** over the last ${duration.value} ${duration.unit}(s)`];
    for (let stat in stats) {
        if (keepStat(stat, stats[stat])) {
            msg.push(`> ${stat}: ${stats[stat]}`);
        }
    }
    // no stats pushed, no matches played
    if (msg.length == 1) {
        msg.push("> No matches played!");
    }
    return msg.join('\n');
}

function escapeMarkdown(text) {
    return text.replace(/([_*])/, '\\$1');
}

function parseDuration(d) {
    if (!d) {
        return {value: 1, unit: 'day'};
    }
    let rx = /([0-9]+)([h|d|w|mo])/;
    let match = d.match(rx);
    return {
        value: match[1],
        unit: function(x) {
            switch(x) {
                case 'h': return 'hour';
                case 'd': return 'day';
                case 'w': return 'week';
                case 'm': return 'month';
            }
        }(match[2])
    }
}

function shuffle(arr) {
    return arr.map(x => ({ key: Math.random(), val: x }))
        .sort((a, b) => a.key - b.key)
        .map(x => x.val);
}

function formatDuration(s) {
    return moment.duration(s, 'seconds').format("w[w] d[d] h[h] m[m] s[s]", {trim: "both mid"});
}