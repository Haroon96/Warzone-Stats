import { Message } from "discord.js";
import { sendPlayerStats } from "../cod/stats";
import { getPlayerProfile } from "../cod/tracker-api";
import { Player } from "../common/types";
import { DAL } from "../dal/mongo-dal";
import { formatPlayername, parseDuration } from "../utilities/util";

export async function postStats(message: Message, args) {
    
    const { modeId, playerId, platformId, duration } = args;

    let players: Array<Player>;

    if (platformId && playerId) {
        // if requesting for a specific player
        // check if player exists
        let player = await getPlayerProfile(platformId, playerId);
        if (player) {
            players = [ player ];
        } else {
            await message.reply("Player does not exist!");
            return;
        }
    } else {
        // if requesting for all registered players
        // fetch list of registered players
        let guildId = message.guild.id;
        players = await DAL.getGuildPlayers(guildId);

        // check if players registered
        if (!players || !players.length) {
            await message.reply("No players registered! See `register` command.");
            return;
        }
    }

    players.forEach(async player => {
        await sendPlayerStats(message, player, parseDuration(duration), modeId);
    });    

} 

export async function postPlayers(message: Message, args) {
    // fetch guild id
    const guildId = message.guild.id;

    // fetch players from db
    let players = await DAL.getGuildPlayers(guildId);
    
    // check if players registered
    if (!players || !players.length) {
        await message.reply("No players registered! See `register` command.");
        return;
    }

    let str = players.map(p => formatPlayername(p, message.client))
        .reduce((str, p) => str + '\n' + p);

    await message.reply("Registered players:\n" + str);
}

export async function registerPlayer(message: Message, args) {
    
    const { playerId, platformId } = args;

    // check if player exists
    let player = await getPlayerProfile(platformId, playerId);

    if (player) {
        if (!await DAL.isPlayerRegisteredInGuild(player, message.guild.id)) {
            await DAL.addPlayerToGuild(player, message.guild.id);
            await message.reply(`${formatPlayername(player, message.client)} was registered!`);
        } else {
            await message.reply(`${formatPlayername(player, message.client)} was already registered!`)
        }
        
    } else {
        await message.reply(`${formatPlayername(player, message.client)} does not exist!`);
    }

}

export async function unregisterPlayer(message: Message, args) {
    // get player from args
    const player: Player = args;

    // check if player is registered
    if (await DAL.isPlayerRegisteredInGuild(player, message.guild.id)) {
        await DAL.removePlayerFromGuild(player, message.guild.id);
        await message.reply(`${formatPlayername(player, message.client)} was unregistered!`);
    } else {
        await message.reply(`${formatPlayername(player, message.client)} is not registered!`)
    }

} 

export async function postSingleStats(message: Message, args) {
    await message.reply('This command has been merged with `!wz stats`. Please use that instead.');
}

export function scheduleStats(message: Message){}

export function unscheduleStats(message: Message){}

export function postTeamSplit(message: Message){}
