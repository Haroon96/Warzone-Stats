import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction } from "discord.js"
import { getPlayerProfile } from "../api/trackergg_api.js"
import { Command, Platform, Player } from "../common/types.js"
import { DAL } from "../dal/mongo-dal.js"
import { formatPlayername } from "../utilities/utils.js"

const command: Command = { name: 'players', execute, autocomplete }
export default command

async function execute(interaction: CommandInteraction) {
    const cmd = interaction.options.getSubcommand(true)

    if (cmd == 'list') {
        await listPlayers(interaction)
    } else if (cmd == 'register') {
        await registerPlayer(interaction)
    } else if (cmd == 'remove') {
        await removePlayer(interaction)
    } else {
        await interaction.reply('Unknown command provided!')
    }
}

async function autocomplete(interaction: AutocompleteInteraction) {
    const cmd = interaction.options.getSubcommand(true)
    const platform = interaction.options.getString('platform', true) as Platform

    let players: Player[] = []

    if (cmd == 'register') {
        players = await DAL.getFilteredPlayers(interaction.guildId!, platform, false)
    } else if (cmd == 'remove') {
        players = await DAL.getFilteredPlayers(interaction.guildId!, platform, true)
    }

    const options: ApplicationCommandOptionChoice[] = players.map((player) => ({ name: player.playerId, value: player.playerId }))
    interaction.respond(options)
}

export async function listPlayers(interaction: CommandInteraction) {
    // fetch active players
    const players = await DAL.getFilteredPlayers(interaction.guildId!, null, true)

    // check if any players are registered
    if (!players || !players.length) {
        await interaction.reply("No players registered! See `/players register` command.")
        return
    }

    const str = players.map(p => formatPlayername(p, interaction.client))
        .reduce((str, p) => str + '\n' + p)

    await interaction.reply("Registered players:\n" + str)
}

export async function registerPlayer(interaction: CommandInteraction) {
    const platform = interaction.options.getString('platform', true) as Platform
    const playerId = interaction.options.getString('id', true)

    // check if player exists
    const player = await getPlayerProfile(platform, playerId)

    if (player) {
        // check if player is not already registered
        if (!await DAL.isPlayerRegisteredInGuild(player, interaction.guildId!)) {
            await DAL.activatePlayerInGuild(player, interaction.guildId!)
            await interaction.reply(`${formatPlayername(player, interaction.client)} has been registered!`)
        } else {
            await interaction.reply(`${formatPlayername(player, interaction.client)} is already registered!`)
        }

    } else {
        let fakePlayer: Player = { playerId: playerId, platformId: platform, active: true }
        await interaction.reply(`${formatPlayername(fakePlayer, interaction.client)} does not exist!`)
    }

}

export async function removePlayer(interaction: CommandInteraction) {

    const platform = interaction.options.getString('platform', true) as Platform
    const playerId = interaction.options.getString('id', true)

    // get player from db
    const player = await DAL.getPlayer(interaction.guildId!, platform, playerId)

    // check if the player is registered in db
    if (player) {
        await DAL.deactivatePlayerInGuild(player, interaction.guildId!)
        await interaction.reply(`${formatPlayername(player, interaction.client)} was unregistered!`)
    } else {
        await interaction.reply(`${formatPlayername(player, interaction.client)} is not registered!`)
    }

}