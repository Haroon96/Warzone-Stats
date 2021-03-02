import { Client, Message } from 'discord.js';
import controller from './controller/controller';
import * as moment from 'moment';
import { Scheduler } from './utilities/scheduler';
import { DAL } from './dal/mongo-dal';

function main() {
    const bot = new Client();

    bot.login(process.env.TOKEN);

    bot.on('ready', async() => {
        // init pre-reqs
        await DAL.init();
        await Scheduler.init(bot);

        // set bot status
        await bot.user.setActivity({name: "for '!wz' commands", type: "WATCHING"});
        console.info(`Logged in as ${bot.user.tag}`);
    });

    bot.on('message', async(message: Message) => {
        // check if the message is intended for the bot
        if (!message.content.startsWith('!wz ')) {
            return;
        } 
        
        // log the message
        console.log(moment().format(), message.author.username, message.content);

        // forward to controller
        await controller(message);
    });
}

main();