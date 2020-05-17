module.exports = {
    tokenize: tokenize,
    pprint: pprint
};

function tokenize(msg) {
    return msg.toLowerCase().split(' ').filter(x => x != '');
}

function pprint(username, stats) {
    let msg = `Stats for **${username}** over the last 24 hours\n`;
    for (let stat in stats) {
        msg += `> ${stat}: ${stats[stat]}\n`;
    }
    return msg;
}