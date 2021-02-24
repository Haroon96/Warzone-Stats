import { Message } from "discord.js";
import { sendPlayerStats } from "../cod/stats";
import { getPlayerProfile } from "../cod/tracker-api";
import { GameMode, Player } from "../common/types";
import { DAL } from "../dal/mongo-dal";
import { getEmbedTemplate, parseDuration, parseGameMode } from "../utilities/util";

export async function postStats(message: Message, args: Array<string>) {
    
    let [ mode, playerId, platformId, duration ] = args;

    if (platformId && playerId) {
        // if requesting for a specific user
        // check if player exists
        let player = await getPlayerProfile(platformId, playerId);
        if (player) {
            await sendPlayerStats(message, player, parseDuration(duration), parseGameMode(mode));
        } else {
            message.reply(getEmbedTemplate("Error", "Player does not exist!"));
        }
    } else {
        // if requesting for all registered users
        // fetch list of registered users
        let guildId = message.guild.id;
        let players = await DAL.getGuildPlayers(guildId);
        // check if players registered
        if (players && players.length) {
            players.forEach(async player => {
                await sendPlayerStats(message, player, parseDuration(duration), parseGameMode(mode));
            });    
        } else {
            message.reply(getEmbedTemplate("Error", "No players registered for this server! See `!wz register` command."));
        }
    }

} 

export function postUsers(message: Message){}
export function registerUser(message: Message){}
export function unregisterUser(message: Message){} 
export function postSingleStats(message: Message){} 
export function scheduleStats(message: Message){}
export function unscheduleStats(message: Message){}
export function postHelp(message: Message){}
export function postTeamSplit(message: Message){}
