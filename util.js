module.exports = {
    tokenize: tokenize,
    pprint: pprint,
    escapeMarkdown: escapeMarkdown
};

function tokenize(msg) {
    return msg.toLowerCase().split(/ +/);
}

function pprint(username, stats) {
    let msg = `Stats for **${username}** over the last 24 hours\n`;
    for (let stat in stats) {
        msg += `> ${stat}: ${stats[stat]}\n`;
    }
    return msg;
}

function escapeMarkdown(text) {
    return text.replace(/([_*])/, '\\$1');
}