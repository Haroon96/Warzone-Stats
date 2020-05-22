const discord = require('discord.js');
const bot = new discord.Client();

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
        console.info(`Logged in as ${bot.user.tag}`);
    });
    
    // run when message received
    bot.on('message', async(msg) => {
        // only respond to messages starting with !cds
        if (!msg.content.startsWith('!cds')) {
            return;
        }

        console.log(`[${new Date().toISOString()}] ${msg.content}`);
        
        // forward to controller
        controller(msg);
    });    
}

