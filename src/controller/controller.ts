import { Message } from "discord.js";
import { parseArgs, trimWhitespace } from "../utilities/util.js";
import commandMap from "./mapping.js";
import { updateAnalyticsSheet } from "../utilities/analytics.js"

export async function controller(message: Message) {

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