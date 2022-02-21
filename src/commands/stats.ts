import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction } from "discord.js"
import { getPlayerProfile } from "../api/trackergg_api.js"
import { sendPlayerStats } from "../api/stats.js"
import { GameMode, Platform, Player, Command } from "../common/types.js"
import { DAL } from "../dal/mongo-dal.js"
import { parseDuration } from "../utilities/utils.js"
import { codeBlock } from '@discordjs/builders';

const command: Command = { name: 'stats', execute, autocomplete }
export default command

async function execute(interaction: CommandInteraction) {
    const players: Array<Player> = []

    const modeId = interaction.options.getString('mode', true) as GameMode
    const platform = interaction.options.getString('platform', false) as Platform
    const playerId = interaction.options.getString('id', false)
    const duration = parseDuration(interaction.options.getString('duration', false), '24h')

    if (!duration) {
        interaction.reply(codeBlock('fix', `Invalid duration entered: ${interaction.options.getString('duration')}!\nUse h (hours), d (days), w (weeks) or m (months).`))
        return
    }

    // check if called for a specific player
    if (platform && playerId) {
        // check if the specified player exists
        const player = await getPlayerProfile(platform, playerId)

        if (player) {
            // add the player to players array
            players.push(player)
        } else {
            await interaction.reply("Player does not exist!")
        }
    } else {
        // if requesting for all registered players
        // fetch list of players registered in guild
        players.push(...await DAL.getFilteredPlayers(interaction.guildId!, null, true))

        // check if there are players registered in the guild
        if (!players.length) {
            await interaction.reply("No players registered! See `/players` command.")
        }
    }

    await sendPlayerStats(interaction, players, duration, modeId)
}

async function autocomplete(interaction: AutocompleteInteraction) {
    const focus = interaction.options.getFocused(true)
    let options: ApplicationCommandOptionChoice[] = []
    
    if (focus.name == 'player') {
        const platform = interaction.options.getString('platform') as Platform
        let players = (await DAL.getFilteredPlayers(interaction.guildId!, platform, true))

        options = players.map((player) => ({ name: player.playerId, value: player.playerId }))
    } else if (focus.name == 'duration') {
        const numeric = Number(focus.value)

        if (numeric && Number.isInteger(numeric)) {
            options = [
                { name: `${numeric} hour(s)`, value: `${numeric}h` },
                { name: `${numeric} day(s)`, value: `${numeric}d` },
                { name: `${numeric} week(s)`, value: `${numeric}w` },
                { name: `${numeric} month(s)`, value: `${numeric}m` }
            ]
        }
    }

    if (options) {
        interaction.respond(options)
    }

}

