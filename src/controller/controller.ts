import { Message } from "discord.js";
import { parseArgs, trimWhitespace } from "../utilities/util.js";
import commandMap from "./mapping.js";
import { updateAnalyticsSheet } from "../utilities/analytics.js"

export async function controller(message: Message) {
    const eolMsg = `Since May 2020, this bot has helped Warzone players keep track of their stats. What started as a collaboration between 3 friends turned into an active side project as more and more players organically found our bot.

**However, we're sad to announce that the bot is shutting down. The bot will cease operations on 1st of April, 2022.**

This is partly due to the increasing complexity of using the Tracker API, and partly because of lack of time. 

We'd like to extend our thanks to all the people who added the bots to their discord servers, people who opened issues & PRs on the Github repo, and even forked the repo to translate it to other languages. It was truly a pleasure to see our open source project grow.

As a parting gift, here are some stats about the bot:
\`\`\`
Peak concurrent discord servers: 246
Total discord servers: ~350
Commands processed by bot: 21904 since May 2021
Most commands by a single discord server: 4702
Registered players: 687
Game modes tracked: 48
Schedules set: 26
\`\`\`
If you'd like to take a look at the source code, and maybe even setup your own bot using the COD API, check out https://github.com/Haroon96/warzone-stats.

Bye :)
`;

    await message.reply(eolMsg);
    return;

    // sanitize the message body
    message.content = trimWhitespace(message.content).toLowerCase();

    // extract commandName from message
    const commandName = message.content.split(' ')[1];

    // fetch the command from commandMap
    const command = commandMap.get(commandName);

    // if command not found, post help and return
    if (!command) {
        postHelp(message);
        return;
    }

    if (process.env.ENABLE_ANALYTICS) {
        await updateAnalyticsSheet(commandName, message.guild.id);    
    }
    
    // check if command regex matches
    for (const regex of command.regex) {
        if (regex.test(message.content)) {
            try {
                const { groups } = message.content.match(regex);
                const args = parseArgs(groups);
                await command.method(message, args);
            } catch (e) {
                await message.reply("An error occurred!");
                console.error(e);
            }
            return;
        }
    }

    // command syntax was incorrect, post command syntax
    await message.reply(`Invalid command syntax! See usage below.\n\`${command.usage}\``);
}

async function postHelp(message: Message) {

    const str: Array<string> = [];

    for (const c of commandMap.values()) {
        str.push(`${c.help}\n\`${c.usage}\`\n`);
    }

    str.push(...[
        'Parameters: `<required>`, `[optional]`',
        'modeId: `br` Battle Royale, `rmbl` Rumble, `plndr` Plunder, `rsg` Resurgence',
        'platformId: `psn` PlayStation, `xbl` Xbox, `atvi` Activision',
        'duration: `h` hours, `d` days, `w` weeks, `m` months. Defaults to `24h`.'
    ]);
    
    await message.reply('**Warzone Stats Help**\n' + str.join('\n'));
}