const discord = require('discord.js');
const bot = new discord.Client();

const util = require('./util');
const stats = require('./daily-stats');

bot.login(process.env.TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}`);
});

bot.on('message', async msg => {
    // only respond to messages starting with !cds
    if (!msg.content.startsWith('!cds')) {
        return;
    }

    let tokens = util.tokenize(msg.content);
    try {
        if (tokens.length === 3) {
            let platform = tokens[1];
            let username = tokens[2];
            let reply = await stats.getDailyStats(platform, username);
            msg.channel.send(reply);
        } else {
            throw "Invalid format! !cds <platform> <username>";
        }
    } catch (e) {
        msg.channel.send(e);
    }
});