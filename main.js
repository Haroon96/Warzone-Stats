const { Client } = require('discord.js');
const bot = new Client();

const db = require('./db');
const controller = require('./controller');
const scheduler = require('./scheduler');

init();

// run all setup tasks and then start discord bot
async function init() {
    await db.init();
    await scheduler.init(bot);
    await initBot();    
}

async function initBot() {
    // login to bot
    bot.login(process.env.TOKEN);

    // run when ready
    bot.on('ready', () => {
        bot.user.setActivity({name: "for '!wz' commands", type: "WATCHING"});
        console.info(`Logged in as ${bot.user.tag}`);
    });
    
    // run when message received
    bot.on('message', async(msg) => {
        // only respond to messages starting with !wz
        if (!msg.content.startsWith('!wz')) {
            return;
        }

        console.log(`[${new Date().toISOString()}] [${msg.author.username}] ${msg.content}`);
        
        // forward to controller
        controller(msg);
    });    
}

