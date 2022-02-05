import { isValidCron } from "cron-validator"
import { AutocompleteInteraction, CommandInteraction } from "discord.js"
import { Command, GameMode, Schedule } from "../common/types.js"
import { DAL } from "../dal/mongo-dal.js"
import { Scheduler } from "../utilities/scheduler.js"
import { parseDuration } from "../utilities/utils.js"

const command: Command = { name: 'schedule', execute, autocomplete }
export default command

async function execute(interaction: CommandInteraction) {
    const cmd = interaction.options.getSubcommand(true)

    if (cmd == 'list') {
        await listSchedule(interaction)
    } else if (cmd == 'add') {
        await scheduleStats(interaction)
    } else if (cmd == 'remove') {
        await unscheduleStats(interaction)
    } else {
        await interaction.reply('Unknown command provided!')
    }
}

async function autocomplete(interaction: AutocompleteInteraction) {
    
}

async function listSchedule(interaction: CommandInteraction) {
    const schedule = await DAL.getSchedule(interaction.channelId)

    await interaction.reply("Stats scheduled!")
}

async function scheduleStats(interaction: CommandInteraction) {
    // get schedule args
    const cron = interaction.options.getString('cronjob', true)
    const modeId = interaction.options.getString('mode', true) as GameMode
    const duration = parseDuration(interaction.options.getString('duration'))

    // check if cron is valid
    if (!isValidCron(cron)) {
        interaction.reply("Invalid cron syntax! See https://crontab.guru/ for help.")
        return
    }

    // schedule stats
    const schedule: Schedule = { cron, modeId, duration, channelId: interaction.channelId }
    await Scheduler.schedule(schedule)

    await interaction.reply("Stats scheduled!")
}

async function unscheduleStats(interaction: CommandInteraction) {
    // get schedule args
    // const { cron, modeId, duration } = args

    // // unschedule stats
    // const schedule: Schedule = { cron, modeId, duration, channelId: interaction.channel.id }
    // await Scheduler.unschedule(schedule)

    await interaction.reply("Stats unscheduled!")
}


