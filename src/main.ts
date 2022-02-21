import { Client, Intents, Interaction } from 'discord.js'
import { ActivityTypes } from 'discord.js/typings/enums'

import { Command } from './common/types.js'
import { Scheduler } from './utilities/scheduler.js'
import { DAL } from './dal/mongo-dal.js'

import players from './commands/players.js'
import stats from './commands/stats.js'
import schedule from './commands/schedule.js'
import teams from './commands/teams.js'

async function main() {

    // init bot
    const bot = new Client({ intents: [Intents.FLAGS.GUILDS] })
    bot.login(process.env.TOKEN)

    // init pre-reqs
    await DAL.init()
    await Scheduler.init(bot)

    // code migrations
    await DAL.migrate()

    // register commands
    const commands = new Map<string, Command>([
        [players.name, players],
        [stats.name, stats],
        [schedule.name, schedule],
        [teams.name, teams],
    ])

    bot.once('ready', () => {
        // set bot status
        bot.user!.setActivity({ name: "for slash (/) commands", type: ActivityTypes.WATCHING })
        console.info(`Logged in as ${bot.user!.tag}`)
    })

    bot.on('error', (err) => {
        console.error(err)
        process.exit(1)
    })

    bot.on('interactionCreate', async interaction => {
        if (interaction.isCommand() || interaction.isAutocomplete()) {
            // get command
            const command = commands.get(interaction.commandName)
            if (!command) return

            // handle request
            if (interaction.isAutocomplete()) {
                try {
                    await command.autocomplete(interaction)
                } catch (error) {
                    console.error(error)
                }
            } else if (interaction.isCommand()) {
                try {
                    await command.execute(interaction)
                } catch (error) {
                    console.error(error)
                    await interaction.followUp({ content: 'There was an error while executing this command!' })
                }
            }
        }
    })
}

main()
