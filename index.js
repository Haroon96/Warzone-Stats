const discord = require('discord.js');
const bot = new discord.Client();

const db = require('./db');
const controller = require('./controller');


// run all setup tasks and then start discord bot
Promise
    .all([db.init()])
    .then(initBot);

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
        
        // forward to controller
        controller(msg);
    });    
}

