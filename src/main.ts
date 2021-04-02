import { Client, Message } from 'discord.js';
import controller from './controller/controller';
import * as moment from 'moment';
import { Scheduler } from './utilities/scheduler';
import { DAL } from './dal/mongo-dal';

async function main() {

    // init bot
    const bot = new Client();
    bot.login(process.env.TOKEN);

    // init pre-reqs
    await DAL.init();
    await Scheduler.init(bot);


    bot.on('ready', () => {
        // set bot status
        bot.user.setActivity({name: "for '!wz' commands", type: "WATCHING"});
        console.info(`Logged in as ${bot.user.tag}`);
    });
    
    bot.on('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    bot.on('message', async(message: Message) => {
        // check if the message is intended for the bot
        if (!message.content.startsWith('!wz')) {
            return;
        } 
        
        // log the message
        console.log(moment().format(), message.author.username, message.content);

        // forward to controller
        try {
            await controller(message);
        } catch (e) {
            console.error(e);
        }
    });
}

main();
