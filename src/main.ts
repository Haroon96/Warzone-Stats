import { Client, Message } from 'discord.js';
import controller from './controller/controller';
import * as moment from 'moment';

function main() {
    const bot = new Client();

    bot.login(process.env.TOKEN);

    bot.on('ready', () => {
        // set bot status
        bot.user.setActivity({name: "for '!wz' commands", type: "WATCHING"});
        console.info(`Logged in as ${bot.user.tag}`);
    });

    bot.on('message', (message: Message) => {
        // check if the message is intended for the bot
        if (!message.content.startsWith('!wz')) {
            return;
        } 
        
        // log the message
        console.log(moment().format(), message.author.username, message.content);

        // forward to controller
        controller(message);
    });
}

main();