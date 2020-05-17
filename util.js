module.exports = {
    tokenize: tokenize,
    pprint: pprint
};

const moment = require('moment');

function tokenize(msg) {
    return msg.toLowerCase().split(' ').filter(x => x != '');
}

function pprint(username, stats) {
    let msg = `Stats for **${username}** on ${moment().format('DD MMM, YYYY')}\n`;
    for (let stat in stats) {
        msg += `> ${stat}: ${stats[stat]}\n`;
    }
    return msg;
}