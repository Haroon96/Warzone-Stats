module.exports = {
    tokenize,
    generateStatsEmbed,
    generateEmbedTemplate,
    escapeMarkdown,
    parseDuration,
    isValidCron: require('cron-validator').isValidCron,
    shuffle,
    formatDuration
};

const { MessageEmbed } = require('discord.js');
const moment = require('moment');
// load moment-duration
require("moment-duration-format");

function tokenize(msg) {
    return msg.toLowerCase().split(/ +/);
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

function generateEmbedTemplate(user) {
    return new MessageEmbed()
        .setColor('#2D3640')
        .setTitle(`Stats for ${user.username}`)
        .setThumbnail(makeThumbnailUrl(user.avatar))
        .setAuthor('Warzone Stats', 'https://raw.githubusercontent.com/Haroon96/warzone-stats/gh-pages/img/favicon.png', 'https://haroon96.github.io/warzone-stats')
        .setTimestamp();
}

function generateStatsEmbed(user, stats, duration) {

    let embed = generateEmbedTemplate(user);

    // no matches played, early return
    if (stats['Matches'] == 0) {
        embed.setDescription(`No matches played over the past ${duration.value} ${duration.unit}(s)!`);
        return embed;
    }

    // proceed with formatting
    embed.setDescription(`over the past ${duration.value} ${duration.unit}(s)`)
    embed.addField('Matches', stats['Matches']);
    embed.addField('Kills', stats['Kills'], true);
    embed.addField('Deaths', stats['Deaths'], true);
    embed.addField('K/D', stats['K/D'], true);

    for (let stat in stats) {
        if (keepStat(stat, stats[stat])) {
            embed.addField(stat, stats[stat], true);
        }
    }
    
    return embed;
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
        unit: (function(x) {
            switch(x) {
                case 'h': return 'hour';
                case 'd': return 'day';
                case 'w': return 'week';
                case 'm': return 'month';
            }
        })(match[2])
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

function makeThumbnailUrl(url) {
    return url ? `${url}?${Math.random() * 100000}` : 'https://trackercdn.com/cdn/cod.tracker.gg/modern-warfare/images/player-avatar.jpg';
}
