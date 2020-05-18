module.exports = {
    tokenize: tokenize,
    pprint: pprint,
    escapeMarkdown: escapeMarkdown,
    parseDuration: parseDuration,
    verifyCron: verifyCron,
    isValidCron: require('cron-validator').isValidCron
};

function tokenize(msg) {
    return msg.toLowerCase().split(/ +/);
}

function pprint(username, stats, duration) {
    let msg = `Stats for **${username}** over the last ${duration.value} ${duration.unit}(s)\n`;
    for (let stat in stats) {
        msg += `> ${stat}: ${stats[stat]}\n`;
    }
    return msg;
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
                case 'mo': return 'month';
            }
        }(match[2])
    }
}

function verifyCron(cron) {
    try {
        parseExpression(cron);
    } catch (e) {
        throw 'Invalid cron expression!';
    }
}