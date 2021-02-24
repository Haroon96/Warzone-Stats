import { Message } from "discord.js";
import { trimWhitespace } from "../utilities/util";
import commandMap from "./mapping";

export default async function(message: Message) {

    // sanitize the message body
    message.content = trimWhitespace(message.content).toLowerCase();

    // extract commandName from message
    let commandName = message.content.split(' ')[1];

    // fetch the command from commandMap
    let command = commandMap.get(commandName);

    // if command not found, post help and return
    if (!command) {
        postHelp(message);
        return;
    }
    
    // check if command regex matches
    for (let regex of command.regex) {
        if (regex.test(message.content)) {
            let { groups } = message.content.match(regex);
            await command.method(message, groups);
            return;
        }
    }

    // command syntax was incorrect, post command syntax
    await message.reply(`Invalid usage of command! See example usage below.\n${command.usage}`);
}

async function postHelp(message: Message) {

    const str: Array<string> = [];

    for (let c of commandMap.values()) {
        str.push(`${c.help}\n\`${c.usage}\`\n`);
    }

    str.push(...[
        'Parameters: `<required>`, `[optional]`',
        'modeId: `br` Battle Royale, `rmbl` Rumble, `plndr` Plunder',
        'platformId: `psn` PlayStation, `xbl` Xbox, `atvi` Activision',
        'duration: `h` hours, `d` days, `w` weeks, `m` months. Defaults to `24h`.'
    ]);
    
    await message.reply('**Warzone Stats Help**\n' + str.join('\n'));
}