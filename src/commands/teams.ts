import { AutocompleteInteraction, CommandInteraction } from "discord.js"
import { Command } from "../common/types.js"
import { DAL } from "../dal/mongo-dal.js"
import { formatPlayername, shuffle } from "../utilities/utils.js"

const command: Command = { name: 'teams', execute, autocomplete }
export default command

async function execute(interaction: CommandInteraction) {
    const teamSize = interaction.options.getInteger('size', true)

    // get list of registered players
    const players = await DAL.getFilteredPlayers(interaction.guildId, null, true)
    
    shuffle(players)
    
    const str: Array<string> = []
    
    for (let i = 0; i < players.length; ++i) {
        if (i % teamSize == 0) {
            str.push('\nTeam ' + (Math.floor(i / teamSize) + 1))
        }
        str.push(formatPlayername(players[i], interaction.client))
    }

    await interaction.reply(str.join('\n'))
}

async function autocomplete(interaction: AutocompleteInteraction) {
    
}