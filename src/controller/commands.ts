import { Message } from "discord.js";
import { fetchPlayerStats } from "../cod/stats";
import { GameMode } from "../common/types";
import { DAL } from "../dal/mongo-dal";
import { getEmbedTemplate, parseDuration, parseGameMode } from "../utilities/util";

export async function postStats(message: Message, args: Array<string>) {
    let guildId = message.guild.id;
    let players = await DAL.getGuildPlayers(guildId);

    // if no players registered
    if (!players.length) {
        let embed = getEmbedTemplate("", "No players registed!");
        message.reply(embed);
        return;
    }

    let [ mode, duration ] = [parseGameMode(args[0]), parseDuration(args[1])];
    
    players.forEach(async p => {
        await fetchPlayerStats(message, p, duration, mode);
    });

} 

export function postUsers(message: Message){}
export function registerUser(message: Message){}
export function unregisterUser(message: Message){} 
export function postSingleStats(message: Message){} 
export function scheduleStats(message: Message){}
export function unscheduleStats(message: Message){}
export function postHelp(message: Message){}
export function postTeamSplit(message: Message){}
